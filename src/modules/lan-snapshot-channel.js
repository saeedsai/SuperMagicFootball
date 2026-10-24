// Host-to-guest match snapshot transport over an existing RTCDataChannel.
// The caller establishes/trusts the peer connection; this is not signaling,
// cryptographic authentication, interpolation, or gameplay-state application.
import {encodeLanSnapshot,decodeLanSnapshot,acceptLanSnapshot} from './lan-state-snapshot.js';

const guestBindings = new WeakMap();
const hostBindings = new WeakMap();
const validChannel = channel => channel &&
  typeof channel.addEventListener === 'function' &&
  typeof channel.removeEventListener === 'function' &&
  typeof channel.send === 'function';
const validId = id => typeof id === 'string' && /^[A-Za-z0-9_-]{6,32}$/.test(id);

function bindLanSnapshotHostChannel(host, channel, roomId, hostId) {
  if (!host || !('peerId' in host) || !validChannel(channel) ||
      !validId(roomId) || !validId(hostId)) {
    throw new TypeError('Invalid LAN snapshot host binding');
  }
  if (hostBindings.has(channel)) throw new Error('Snapshot host channel already bound');
  let disposed = false;
  let lastTick = -1;
  function send(snapshot) {
    if (disposed || channel.readyState !== 'open' || !host.peerId) return false;
    // A stale host or a different room must never be able to use this channel.
    if (snapshot?.roomId !== roomId || snapshot?.hostId !== hostId) {
      throw new TypeError('Snapshot does not match bound LAN host');
    }
    const wire = encodeLanSnapshot(snapshot);
    if (snapshot.tick <= lastTick) return false;
    try { channel.send(wire); }
    catch { return false; }
    lastTick = snapshot.tick;
    return true;
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    channel.removeEventListener('close', dispose);
    hostBindings.delete(channel);
  }
  channel.addEventListener('close', dispose);
  const binding = Object.freeze({send,dispose,get lastTick() { return lastTick; }});
  hostBindings.set(channel, binding);
  return binding;
}

function bindLanSnapshotGuestChannel(channel, roomId, hostId, onSnapshot, initialTick=-1, signal=null) {
  if (!validChannel(channel) || !validId(roomId) || !validId(hostId) ||
      typeof onSnapshot !== 'function' || !Number.isSafeInteger(initialTick) || initialTick < -1 ||
      (signal != null && (typeof signal.addEventListener !== 'function' ||
        typeof signal.removeEventListener !== 'function' || typeof signal.aborted !== 'boolean'))) {
    throw new TypeError('Invalid LAN snapshot guest binding');
  }
  if (guestBindings.has(channel)) throw new Error('Snapshot guest channel already bound');
  let disposed = false;
  let lastTick = initialTick;
  function onMessage(event) {
    if (disposed || typeof event?.data !== 'string') return;
    let accepted;
    try {
      accepted = acceptLanSnapshot(lastTick, decodeLanSnapshot(event.data), roomId, hostId);
    } catch { return; }
    if (!accepted.accepted) return;
    // A throwing consumer cannot crash the transport or advance its cursor.
    try { onSnapshot(accepted.snapshot); }
    catch { return; }
    lastTick = accepted.lastTick;
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    channel.removeEventListener('message', onMessage);
    channel.removeEventListener('close', dispose);
    signal?.removeEventListener('abort', dispose);
    guestBindings.delete(channel);
  }
  const binding = Object.freeze({dispose,get lastTick() { return lastTick; }});
  // Register before subscribing to abort: an already-aborted or synchronously
  // aborting signal must not leave a stale binding in the WeakMap.
  guestBindings.set(channel, binding);
  channel.addEventListener('message', onMessage);
  channel.addEventListener('close', dispose);
  if (signal?.aborted) dispose();
  else if (signal) {
    signal.addEventListener('abort', dispose, {once:true});
    if (signal.aborted) dispose();
  }
  return binding;
}

export {bindLanSnapshotHostChannel,bindLanSnapshotGuestChannel};
