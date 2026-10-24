// LAN-014: explicit, copy/paste SDP signaling for a single WebRTC DataChannel.
// No signaling server, matchmaking, gameplay loop or automatic LAN discovery.
import {normalizeLanPacket} from './lan_protocol.js';
import {bindLanProtocolChannel} from './lan-protocol-channel.js';
import {bindLanSnapshotHostChannel, bindLanSnapshotGuestChannel} from './lan-snapshot-channel.js';
import {LAN_PROTOCOL_VERSION} from './lan-session.js';

const MAX_SIGNAL_LENGTH = 200000;
const MAX_SDP_LENGTH = 180000;
const DEFAULT_ICE_TIMEOUT_MS = 15000;

function parseLanSignal(raw, expectedKind, hello) {
  if (typeof raw !== 'string' || raw.length > MAX_SIGNAL_LENGTH) {
    throw new Error('Invalid LAN signaling payload size');
  }
  let value;
  try { value = JSON.parse(raw); } catch { throw new Error('Invalid LAN signaling JSON'); }
  if (!value || Object.getPrototypeOf(value) !== Object.prototype ||
      value.protocol !== 1 || value.kind !== expectedKind ||
      value.session !== hello.session || value.build !== hello.build ||
      typeof value.sdp !== 'string' || !value.sdp.startsWith('v=0') ||
      value.sdp.length > MAX_SDP_LENGTH || value.sdp.length < 8) {
    throw new Error('LAN signaling session, build, type or SDP mismatch');
  }
  return {type:expectedKind, sdp:value.sdp};
}

function encodeLanSignal(kind, hello, description) {
  if (!description || description.type !== kind ||
      typeof description.sdp !== 'string' || !description.sdp.startsWith('v=0') ||
      description.sdp.length < 8 || description.sdp.length > MAX_SDP_LENGTH) {
    throw new Error('Invalid gathered LAN SDP');
  }
  return JSON.stringify({protocol:1, kind, session:hello.session,
    build:hello.build, sdp:description.sdp});
}

function waitForLanIceGathering(peer, timeoutMs) {
  // A completed ICE gathering state is not evidence of a usable peer.
  // A closed or failed transport must never be treated as successful.
  if (peer.connectionState === 'closed' || peer.connectionState === 'failed') {
    return Promise.reject(new Error('LAN peer closed during ICE gathering'));
  }
  if (peer.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer;
    function cleanup() {
      clearTimeout(timer);
      peer.removeEventListener('icegatheringstatechange', onChange);
      peer.removeEventListener('connectionstatechange', onChange);
    }
    function finish(error) {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(error); else resolve();
    }
    function onChange() {
      if (peer.connectionState === 'closed' || peer.connectionState === 'failed') {
        finish(new Error('LAN peer closed during ICE gathering'));
      } else if (peer.iceGatheringState === 'complete') finish();
    }
    peer.addEventListener('icegatheringstatechange', onChange);
    if (!settled) peer.addEventListener('connectionstatechange', onChange);
    // Listener registration can synchronously trigger a fake or custom peer
    // event; do not leave a timer behind if the wait already settled.
    if (!settled) timer = setTimeout(() => finish(new Error('LAN ICE gathering timed out')), timeoutMs);
    onChange();
  });
}

function createLanPeerConnection(localHello, options = {}) {
  const hello = normalizeLanPacket(localHello);
  if (hello.type !== 'hello' || hello.sequence !== 0) throw new Error('LAN hello required');
  const Peer = options.RTCPeerConnection ?? globalThis.RTCPeerConnection;
  if (typeof Peer !== 'function') throw new Error('WebRTC RTCPeerConnection unavailable');
  const timeoutMs = options.iceTimeoutMs ?? DEFAULT_ICE_TIMEOUT_MS;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) {
    throw new Error('Invalid LAN ICE timeout');
  }
  // Empty ICE server list supports local candidates without external services.
  const peer = new Peer({iceServers:[]});
  // Fail closed if a custom WebRTC implementation does not provide the
  // event and lifecycle interface required for safe signaling.
  if (!peer || typeof peer.addEventListener !== 'function' ||
      typeof peer.removeEventListener !== 'function' ||
      typeof peer.close !== 'function' ||
      typeof peer.createDataChannel !== 'function' ||
      typeof peer.createOffer !== 'function' ||
      typeof peer.createAnswer !== 'function' ||
      typeof peer.setLocalDescription !== 'function' ||
      typeof peer.setRemoteDescription !== 'function') {
    try { peer?.close?.(); } catch { /* invalid peer */ }
    throw new TypeError('Invalid LAN RTCPeerConnection implementation');
  }
  let channel = null;
  let binding = null;
  let hostSnapshotBinding = null;
  let guestSnapshotBinding = null;
  let guestSnapshotUnsubscribe = null;
  // Snapshot IDs are deterministic for both peers after the validated hello.
  // They identify this transport session, not an authenticated user account.
  const snapshotIdentity = Object.freeze({roomId:hello.session.slice(0,32),
    hostId:`host_${hello.session.slice(-27)}`});
  let disposed = false;
  let phase = 'new';
  // LAN-019: immutable, event-driven lobby diagnostics. This is internal
  // transport state, not a claim that the match loop is networked.
  const statusListeners = new Set();
  let lastStatusKey = null;
  function snapshotStatus() {
    return Object.freeze({
      phase,
      transport: disposed ? 'closed' : peer.connectionState,
      channel: disposed ? 'closed' : (channel?.readyState ?? 'unavailable'),
      ready: phase === 'connected-signaling' && !!binding?.ready && transportUsable()
    });
  }
  function emitStatus() {
    const snapshot = snapshotStatus();
    const key = JSON.stringify(snapshot);
    if (key === lastStatusKey) return;
    lastStatusKey = key;
    for (const listener of [...statusListeners]) {
      try { listener(snapshot); } catch { /* observer must not break RTC */ }
    }
  }
  function subscribeStatus(listener, signal = null) {
    if (typeof listener !== 'function') throw new TypeError('LAN status listener required');
    if (signal != null && (typeof signal.addEventListener !== 'function' ||
        typeof signal.removeEventListener !== 'function' || typeof signal.aborted !== 'boolean')) {
      throw new TypeError('LAN status subscription requires an AbortSignal');
    }
    const unsubscribe = () => {
      statusListeners.delete(listener);
      signal?.removeEventListener('abort', unsubscribe);
    };
    if (!signal?.aborted) {
      // LAN-023: even a disposed peer delivers its final closed snapshot once.
      // Only live peers register persistent observers or abort listeners.
      if (!disposed) {
        statusListeners.add(listener);
        signal?.addEventListener('abort', unsubscribe, {once:true});
      }
      if (!signal?.aborted) {
        try { listener(snapshotStatus()); } catch { /* observer is isolated */ }
      }
    }
    return unsubscribe;
  }
  // Binding registers its message handler first; this observer runs after
  // hello validation and reports readiness transitions without polling.
  function onChannelChange() { emitStatus(); }
  function attach(next) {
    if (disposed || channel || !next || next.label !== 'smf-lan') {
      try { next?.close(); } catch { /* closed/untrusted channel */ }
      return;
    }
    // Guest-created channels arrive from a remote RTC event. Validate their
    // interface before installing protocol handlers or publishing readiness.
    if (typeof next.addEventListener !== 'function' ||
        typeof next.removeEventListener !== 'function' ||
        typeof next.send !== 'function' ||
        typeof next.close !== 'function') {
      try { next.close?.(); } catch { /* malformed channel */ }
      return;
    }
    channel = next;
    binding = bindLanProtocolChannel(hello, channel);
    channel.addEventListener('open', onChannelChange);
    channel.addEventListener('close', onChannelChange);
    channel.addEventListener('message', onChannelChange);
    emitStatus();
  }
  function onDataChannel(event) {
    if (hello.role === 'guest') attach(event.channel);
    else { try { event.channel?.close(); } catch { /* unexpected channel */ } }
  }
  peer.addEventListener('datachannel', onDataChannel);
  peer.addEventListener('connectionstatechange', emitStatus);
  if (hello.role === 'host') {
    // A malformed injected channel must not leave an RTC peer alive after
    // attachment fails; real browsers expose this complete EventTarget API.
    let outgoing;
    try {
      outgoing = peer.createDataChannel('smf-lan', {ordered:true});
      if (!outgoing || typeof outgoing.addEventListener !== 'function' ||
          typeof outgoing.removeEventListener !== 'function' ||
          typeof outgoing.send !== 'function' ||
          typeof outgoing.close !== 'function') {
        throw new TypeError('Invalid LAN RTCDataChannel implementation');
      }
      attach(outgoing);
    } catch (error) {
      try { outgoing?.close?.(); } catch { /* invalid channel */ }
      try { peer.close(); } catch { /* invalid peer */ }
      throw error;
    }
  }

  function assertPhase(role, expected) {
    if (disposed || hello.role !== role || phase !== expected) {
      throw new Error('Invalid LAN signaling role or phase');
    }
  }
  async function createOffer() {
    assertPhase('host', 'new');
    phase = 'gathering-offer';
    emitStatus();
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await waitForLanIceGathering(peer, timeoutMs);
    if (disposed) throw new Error('LAN peer disposed');
    const signal = encodeLanSignal('offer', hello, peer.localDescription);
    phase = 'awaiting-answer';
    emitStatus();
    return signal;
  }
  async function acceptOffer(raw) {
    assertPhase('guest', 'new');
    const remote = parseLanSignal(raw, 'offer', hello);
    phase = 'gathering-answer';
    emitStatus();
    await peer.setRemoteDescription(remote);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    await waitForLanIceGathering(peer, timeoutMs);
    if (disposed) throw new Error('LAN peer disposed');
    const signal = encodeLanSignal('answer', hello, peer.localDescription);
    phase = 'connected-signaling';
    emitStatus();
    return signal;
  }
  async function acceptAnswer(raw) {
    assertPhase('host', 'awaiting-answer');
    const remote = parseLanSignal(raw, 'answer', hello);
    phase = 'setting-answer';
    emitStatus();
    await peer.setRemoteDescription(remote);
    if (disposed) throw new Error('LAN peer disposed');
    phase = 'connected-signaling';
    emitStatus();
  }
  // LAN-014 recovery: close the half-open peer after any asynchronous signaling
  // failure so a fresh attempt can start without a stranded RTC connection.
  async function guarded(operation) {
    const startingPhase = phase;
    try { return await operation(); }
    catch (error) {
      // Invalid roles, replayed packets and malformed offers are rejected
      // before changing phase. They must not tear down a healthy session.
      // Only a failed operation that began changing RTC state is terminal.
      if (phase !== startingPhase) dispose();
      throw error;
    } finally { emitStatus(); }
  }
  // LAN-018: an open channel alone does not prove that the RTC transport is
  // usable. A disconnected peer can recover; a failed/closed one must not
  // report ready or accept input while its DataChannel still appears open.
  function transportUsable() {
    return !disposed && channel?.readyState === 'open' &&
      peer.connectionState !== 'disconnected' &&
      peer.connectionState !== 'failed' && peer.connectionState !== 'closed';
  }
  // LAN-015: await the actual protocol handshake, not merely the SDP exchange.
  // This bounded gate is for future lobby/game-loop wiring; it does not
  // claim a playable two-browser session by itself.
  function awaitReady(timeoutMs = DEFAULT_ICE_TIMEOUT_MS, signal = null) {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) {
      return Promise.reject(new RangeError('Invalid LAN readiness timeout'));
    }
    if (signal != null && (typeof signal.addEventListener !== 'function' ||
        typeof signal.removeEventListener !== 'function' || typeof signal.aborted !== 'boolean')) {
      return Promise.reject(new TypeError('LAN readiness requires an AbortSignal'));
    }
    if (disposed) return Promise.reject(new Error('LAN peer disposed'));
    if (signal?.aborted) return Promise.reject(new Error('LAN readiness cancelled'));
    if (peer.connectionState === 'failed' || peer.connectionState === 'closed' ||
        channel?.readyState === 'closed') {
      return Promise.reject(new Error('LAN peer closed before handshake'));
    }
    if (phase === 'connected-signaling' && binding?.ready && transportUsable()) return Promise.resolve(binding);
    return new Promise((resolve, reject) => {
      let finished = false;
      let poll;
      let timeout;
      function finish(error) {
        if (finished) return;
        finished = true;
        clearInterval(poll);
        clearTimeout(timeout);
        signal?.removeEventListener('abort', onAbort);
        if (error) reject(error); else resolve(binding);
      }
      function onAbort() { finish(new Error('LAN readiness cancelled')); }
      signal?.addEventListener('abort', onAbort, {once:true});
      function check() {
        if (signal?.aborted) finish(new Error('LAN readiness cancelled'));
        else if (disposed || peer.connectionState === 'failed' ||
            peer.connectionState === 'closed' || channel?.readyState === 'closed') {
          finish(new Error('LAN peer closed before handshake'));
        } else if (phase === 'connected-signaling' && binding?.ready && transportUsable()) {
          finish();
        }
      }
      poll = setInterval(check, 25);
      timeout = setTimeout(() => finish(new Error('LAN handshake timed out')), timeoutMs);
      check();
    });
  }
  // LAN-016: expose the already-validated four-button guest/host frame bridge
  // only after both SDP signaling and the protocol hello have completed.
  // The caller still owns the real match loop and snapshot rendering.
  function sendGuestInput(frame, buttons = [], dx = 0, dy = 0) {
    if (disposed || hello.role !== 'guest' || phase !== 'connected-signaling' ||
        !binding?.ready || !transportUsable()) {
      throw new Error('LAN guest input requires a ready guest connection');
    }
    return binding.sendInput(frame, buttons, dx, dy);
  }
  // LAN-025: validated guest inputs can be observed by a future authoritative
  // match loop; observers cannot bypass host frame advancement.
  function subscribeHostInput(listener, signal = null) {
    if (disposed || hello.role !== 'host' || !binding) {
      throw new Error('LAN host input subscription requires an active host');
    }
    return binding.subscribeInput(listener, signal);
  }
  // LAN-026: authoritative frame consumption events are separate from
  // raw packet acceptance and never advance the match simulation themselves.
  function subscribeHostFrame(listener, signal = null) {
    if (disposed || hello.role !== 'host' || !binding) {
      throw new Error('LAN host frame subscription requires an active host');
    }
    return binding.subscribeFrame(listener, signal);
  }
  function advanceHostFrame(frame) {
    if (disposed || hello.role !== 'host' || phase !== 'connected-signaling' ||
        !binding?.ready || !transportUsable()) {
      throw new Error('LAN host frame requires a ready host connection');
    }
    return binding.advance(frame);
  }
  // LAN-027: use the same negotiated DataChannel for authoritative snapshots.
  // The game must supply actual match state; no rendering or simulation occurs here.
  function sendHostSnapshot(snapshot) {
    if (disposed || hello.role !== 'host' || phase !== 'connected-signaling' ||
        !binding?.ready || !transportUsable()) {
      throw new Error('LAN host snapshot requires a ready host connection');
    }
    if (!hostSnapshotBinding) {
      const joined = {get peerId() {
        return !disposed && binding?.ready && transportUsable() ? hello.session : null;
      }};
      hostSnapshotBinding = bindLanSnapshotHostChannel(joined, channel,
        snapshotIdentity.roomId, snapshotIdentity.hostId);
    }
    return hostSnapshotBinding.send(snapshot);
  }
  // LAN-041: game-loop-friendly host bridge. The authoritative simulation
  // supplies a normalized frame; transport injects the immutable session
  // identity rather than requiring gameplay code to construct wire packets.
  // This does not simulate the match or render guest snapshots.
  function sendHostMatchState(state) {
    if (!state || Object.getPrototypeOf(state) !== Object.prototype ||
        Object.keys(state).length !== 5 ||
        !['tick','clockMs','scores','ball','players'].every(key => Object.hasOwn(state,key))) {
      throw new TypeError('Invalid LAN host match state');
    }
    return sendHostSnapshot({type:'snapshot',version:LAN_PROTOCOL_VERSION,
      ...snapshotIdentity,tick:state.tick,clockMs:state.clockMs,
      scores:state.scores,ball:state.ball,players:state.players});
  }
  function subscribeGuestSnapshots(listener, initialTick = -1, signal = null) {
    if (signal != null && (typeof signal.addEventListener !== 'function' ||
        typeof signal.removeEventListener !== 'function' || typeof signal.aborted !== 'boolean')) {
      throw new TypeError('LAN snapshot subscription requires an AbortSignal');
    }
    if (signal?.aborted) throw new Error('LAN snapshot subscription cancelled');
    if (disposed || hello.role !== 'guest' || phase !== 'connected-signaling' ||
        !binding?.ready || !transportUsable()) {
      throw new Error('LAN guest snapshots require a ready guest connection');
    }
    if (guestSnapshotBinding) throw new Error('LAN guest snapshot receiver already active');
    if (typeof listener !== 'function') throw new TypeError('Invalid LAN snapshot guest binding');
    const receiver = bindLanSnapshotGuestChannel(channel,
      snapshotIdentity.roomId, snapshotIdentity.hostId, snapshot => {
        if (disposed || !binding?.ready || !transportUsable()) {
          throw new Error('LAN guest snapshot received while disconnected');
        }
        listener(snapshot);
      }, initialTick);
    guestSnapshotBinding = receiver;
    const onAbort = () => unsubscribe();
    function unsubscribe() {
      signal?.removeEventListener('abort', onAbort);
      receiver.dispose();
      if (guestSnapshotBinding === receiver) {
        guestSnapshotBinding = null;
        guestSnapshotUnsubscribe = null;
      }
    }
    guestSnapshotUnsubscribe = unsubscribe;
    signal?.addEventListener('abort', onAbort, {once:true});
    if (signal?.aborted) {
      unsubscribe();
      throw new Error('LAN snapshot subscription cancelled');
    }
    return Object.freeze({
      get lastTick() { return receiver.lastTick; },
      dispose() {
        unsubscribe();
      }
    });
  }
  // LAN-042: give a guest renderer a match-state-shaped, immutable view.
  // The snapshot receiver still validates identity, ordering and readiness.
  function subscribeGuestMatchState(listener, initialTick = -1, signal = null) {
    if (typeof listener !== 'function') throw new TypeError('Invalid LAN guest match state listener');
    return subscribeGuestSnapshots(snapshot => listener(Object.freeze({
      tick:snapshot.tick, clockMs:snapshot.clockMs, scores:snapshot.scores,
      ball:snapshot.ball, players:snapshot.players
    })), initialTick, signal);
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    hostSnapshotBinding?.dispose();
    guestSnapshotUnsubscribe?.();
    guestSnapshotBinding = null;
    guestSnapshotUnsubscribe = null;
    phase = 'closed';
    peer.removeEventListener('datachannel', onDataChannel);
    peer.removeEventListener('connectionstatechange', emitStatus);
    if (channel) {
      channel.removeEventListener('open', onChannelChange);
      channel.removeEventListener('close', onChannelChange);
      channel.removeEventListener('message', onChannelChange);
    }
    binding?.dispose();
    try { channel?.close(); } catch { /* already closed */ }
    peer.close();
    emitStatus();
    statusListeners.clear();
  }
  return Object.freeze({createOffer:()=>guarded(createOffer), acceptOffer:raw=>guarded(()=>acceptOffer(raw)), acceptAnswer:raw=>guarded(()=>acceptAnswer(raw)), awaitReady, sendGuestInput, advanceHostFrame, sendHostSnapshot, sendHostMatchState, subscribeGuestSnapshots, subscribeGuestMatchState, subscribeHostInput, subscribeHostFrame, subscribeStatus, dispose,
    get snapshotIdentity() { return snapshotIdentity; },
    get status() { return snapshotStatus(); },
    get ready() { return phase === 'connected-signaling' && !!binding?.ready && transportUsable(); },
    get phase() { return phase; },
    // Read-only transport diagnostics for future LAN lobby status messages.
    get transportState() { return disposed ? 'closed' : peer.connectionState; },
    get channelState() { return disposed ? 'closed' : (channel?.readyState ?? 'unavailable'); },
    get binding() { return binding; },
    get peer() { return peer; },
    get disposed() { return disposed; }
  });
}

export {createLanPeerConnection, parseLanSignal, encodeLanSignal, waitForLanIceGathering};
