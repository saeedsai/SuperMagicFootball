// LAN-014: explicit, copy/paste SDP signaling for a single WebRTC DataChannel.
// No signaling server, matchmaking, gameplay loop or automatic LAN discovery.
import {normalizeLanPacket} from './lan_protocol.js';
import {bindLanProtocolChannel} from './lan-protocol-channel.js';

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
    peer.addEventListener('connectionstatechange', onChange);
    timer = setTimeout(() => finish(new Error('LAN ICE gathering timed out')), timeoutMs);
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
  let channel = null;
  let binding = null;
  let disposed = false;
  let phase = 'new';
  function attach(next) {
    if (disposed || channel || !next || next.label !== 'smf-lan') {
      try { next?.close(); } catch { /* closed/untrusted channel */ }
      return;
    }
    channel = next;
    binding = bindLanProtocolChannel(hello, channel);
  }
  function onDataChannel(event) {
    if (hello.role === 'guest') attach(event.channel);
    else { try { event.channel?.close(); } catch { /* unexpected channel */ } }
  }
  peer.addEventListener('datachannel', onDataChannel);
  if (hello.role === 'host') attach(peer.createDataChannel('smf-lan', {ordered:true}));

  function assertPhase(role, expected) {
    if (disposed || hello.role !== role || phase !== expected) {
      throw new Error('Invalid LAN signaling role or phase');
    }
  }
  async function createOffer() {
    assertPhase('host', 'new');
    phase = 'gathering-offer';
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await waitForLanIceGathering(peer, timeoutMs);
    if (disposed) throw new Error('LAN peer disposed');
    const signal = encodeLanSignal('offer', hello, peer.localDescription);
    phase = 'awaiting-answer';
    return signal;
  }
  async function acceptOffer(raw) {
    assertPhase('guest', 'new');
    const remote = parseLanSignal(raw, 'offer', hello);
    phase = 'gathering-answer';
    await peer.setRemoteDescription(remote);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    await waitForLanIceGathering(peer, timeoutMs);
    if (disposed) throw new Error('LAN peer disposed');
    const signal = encodeLanSignal('answer', hello, peer.localDescription);
    phase = 'connected-signaling';
    return signal;
  }
  async function acceptAnswer(raw) {
    assertPhase('host', 'awaiting-answer');
    const remote = parseLanSignal(raw, 'answer', hello);
    phase = 'setting-answer';
    await peer.setRemoteDescription(remote);
    if (disposed) throw new Error('LAN peer disposed');
    phase = 'connected-signaling';
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
    }
  }
  // LAN-015: await the actual protocol handshake, not merely the SDP exchange.
  // This bounded gate is for future lobby/game-loop wiring; it does not
  // claim a playable two-browser session by itself.
  function awaitReady(timeoutMs = DEFAULT_ICE_TIMEOUT_MS) {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) {
      return Promise.reject(new RangeError('Invalid LAN readiness timeout'));
    }
    if (disposed) return Promise.reject(new Error('LAN peer disposed'));
    if (phase === 'connected-signaling' && binding?.ready) return Promise.resolve(binding);
    return new Promise((resolve, reject) => {
      let finished = false;
      let poll;
      let timeout;
      function finish(error) {
        if (finished) return;
        finished = true;
        clearInterval(poll);
        clearTimeout(timeout);
        if (error) reject(error); else resolve(binding);
      }
      function check() {
        if (disposed || peer.connectionState === 'failed' ||
            peer.connectionState === 'closed' || channel?.readyState === 'closed') {
          finish(new Error('LAN peer closed before handshake'));
        } else if (phase === 'connected-signaling' && binding?.ready) {
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
        !binding?.ready || channel?.readyState !== 'open') {
      throw new Error('LAN guest input requires a ready guest connection');
    }
    return binding.sendInput(frame, buttons, dx, dy);
  }
  function advanceHostFrame(frame) {
    if (disposed || hello.role !== 'host' || phase !== 'connected-signaling' ||
        !binding?.ready || channel?.readyState !== 'open') {
      throw new Error('LAN host frame requires a ready host connection');
    }
    return binding.advance(frame);
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    phase = 'closed';
    peer.removeEventListener('datachannel', onDataChannel);
    binding?.dispose();
    try { channel?.close(); } catch { /* already closed */ }
    peer.close();
  }
  return Object.freeze({createOffer:()=>guarded(createOffer), acceptOffer:raw=>guarded(()=>acceptOffer(raw)), acceptAnswer:raw=>guarded(()=>acceptAnswer(raw)), awaitReady, sendGuestInput, advanceHostFrame, dispose,
    get ready() { return !disposed && phase === 'connected-signaling' && !!binding?.ready; },
    get phase() { return phase; },
    get binding() { return binding; },
    get peer() { return peer; },
    get disposed() { return disposed; }
  });
}

export {createLanPeerConnection, parseLanSignal, encodeLanSignal, waitForLanIceGathering};
