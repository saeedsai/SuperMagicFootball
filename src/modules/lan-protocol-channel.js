// LAN-013: bind the existing host-authoritative protocol to an RTCDataChannel.
// The caller owns peer connection, SDP/ICE exchange and match-loop integration.
import {
  normalizeLanPacket, createLanHostSession, acceptLanHostMessage, advanceLanHostFrame,
  createLanGuestSession, acceptLanGuestHello, sendLanGuestFrame, sendLanChannelPacket
} from './lan_protocol.js';

const bindings = new WeakMap();

function bindLanProtocolChannel(localHello, channel) {
  const local = normalizeLanPacket(localHello);
  if (local.type !== 'hello' || local.sequence !== 0 ||
      !channel || typeof channel.addEventListener !== 'function' ||
      typeof channel.removeEventListener !== 'function' ||
      typeof channel.send !== 'function') {
    throw new TypeError('Expected a LAN hello and RTCDataChannel');
  }
  if (bindings.has(channel)) throw new Error('LAN protocol channel already bound');

  let state = local.role === 'host'
    ? createLanHostSession(local) : createLanGuestSession(local);
  let disposed = false;
  let helloSent = false;
  // LAN-025: host-only notifications after authoritative input validation.
  // Subscribers do not advance the simulation or change packet acceptance.
  const inputObservers = new Set();
  function subscribeInput(listener, signal = null) {
    if (local.role !== 'host') throw new Error('LAN host input subscription requires host');
    if (typeof listener !== 'function') throw new TypeError('LAN input listener required');
    if (signal != null && (typeof signal.addEventListener !== 'function' ||
        typeof signal.removeEventListener !== 'function' || typeof signal.aborted !== 'boolean')) {
      throw new TypeError('LAN input subscription requires an AbortSignal');
    }
    const entry = {listener, signal, unsubscribe: null};
    const unsubscribe = () => {
      inputObservers.delete(entry);
      signal?.removeEventListener('abort', unsubscribe);
    };
    entry.unsubscribe = unsubscribe;
    if (!disposed && !signal?.aborted) {
      inputObservers.add(entry);
      signal?.addEventListener('abort', unsubscribe, {once:true});
    }
    return unsubscribe;
  }

  function hello() {
    if (disposed || channel.readyState !== 'open') return false;
    try {
      sendLanChannelPacket(channel, local);
      helloSent = true;
      return true;
    } catch { return false; }
  }

  function onMessage(event) {
    if (disposed || typeof event?.data !== 'string') return;
    try {
      if (state.peer.ready) {
        if (local.role === 'host') {
          const nextFrame = Math.max(0, (state.lastSimulatedFrame ?? -1) + 1);
          const received = acceptLanHostMessage(state, event.data, nextFrame);
          if (received.kind === 'accepted') {
            state = received.state;
            // The queue contains only validated, in-window inputs. The latest
            // accepted packet is immutable and remains queued for advance().
            const packet = state.queue.pending.at(-1);
            for (const observer of [...inputObservers]) {
              try { observer.listener(packet); } catch { /* isolate game/UI observers */ }
            }
          }
        }
        return;
      }
      if (local.role === 'host') {
        const received = acceptLanHostMessage(state, event.data, 0);
        if (received.kind !== 'ready') return;
        state = received.state;
      } else {
        state = acceptLanGuestHello(state, event.data);
      }
      // A peer bound after our first hello may have missed it. One echo on
      // the first valid remote hello completes that race without a ping loop.
      hello();
    } catch {
      // Ignore malformed, foreign, replayed and premature untrusted traffic.
    }
  }

  function sendInput(frame, buttons = [], dx = 0, dy = 0) {
    if (disposed || local.role !== 'guest' || !helloSent) {
      throw new Error('LAN guest channel is not ready');
    }
    const sent = sendLanGuestFrame(state, channel, frame, buttons, dx, dy);
    state = sent.state;
    return sent.packet;
  }

  function advance(frame) {
    if (disposed || local.role !== 'host' || !state.peer.ready) {
      throw new Error('LAN host channel is not ready');
    }
    const next = advanceLanHostFrame(state, frame);
    state = next.state;
    return Object.freeze({input:next.input, received:next.received});
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    channel.removeEventListener('open', hello);
    channel.removeEventListener('message', onMessage);
    channel.removeEventListener('close', dispose);
    for (const observer of [...inputObservers]) observer.unsubscribe();
    bindings.delete(channel);
  }

  channel.addEventListener('open', hello);
  channel.addEventListener('message', onMessage);
  channel.addEventListener('close', dispose);
  const binding = Object.freeze({
    hello, sendInput, advance, subscribeInput, dispose,
    get ready() { return !disposed && helloSent && state.peer.ready; },
    get state() { return state; },
    get disposed() { return disposed; }
  });
  bindings.set(channel, binding);
  if (channel.readyState === 'open') hello();
  return binding;
}

export {bindLanProtocolChannel};
