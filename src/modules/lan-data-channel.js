// Browser RTCDataChannel bindings for a single host and one guest.
// Caller owns RTCPeerConnection creation and SDP/ICE signaling.
// No match-state replication or automatic peer discovery is implied.
import {decodeLanWirePacket, encodeLanWirePacket} from './lan-wire.js';
import {LAN_PROTOCOL_VERSION} from './lan-session.js';

const boundHosts = new WeakMap();
const usableChannel = channel => channel &&
  typeof channel.addEventListener === 'function' &&
  typeof channel.removeEventListener === 'function' &&
  typeof channel.send === 'function';

function bindLanHostChannel(host, channel) {
  if (!host || typeof host.receive !== 'function' ||
      typeof host.disconnected !== 'function' || !usableChannel(channel)) {
    throw new TypeError('Expected a LAN host adapter and RTCDataChannel');
  }
  if (boundHosts.has(host)) throw new Error('Host already has a bound channel');
  let identity = null;
  let disposed = false;
  function onMessage(event) {
    if (disposed || typeof event?.data !== 'string') return;
    let packet;
    try { packet = decodeLanWirePacket(event.data); }
    catch { return; }
    // A socket cannot switch identities after its first accepted hello.
    if (identity !== null && packet.peerId !== identity) return;
    if (identity === null && packet.type !== 'hello') return;
    const result = host.receive(event.data);
    if (result.accepted && packet.type === 'hello') identity = packet.peerId;
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    channel.removeEventListener('message', onMessage);
    channel.removeEventListener('close', dispose);
    boundHosts.delete(host);
    if (identity !== null) host.disconnected(identity);
  }
  channel.addEventListener('message', onMessage);
  channel.addEventListener('close', dispose);
  const binding = Object.freeze({dispose, get peerId() { return identity; }});
  boundHosts.set(host, binding);
  return binding;
}

function bindLanGuestChannel(channel, roomId, peerId) {
  if (!usableChannel(channel)) throw new TypeError('Expected an RTCDataChannel');
  // Validate identity and version before attaching any listeners.
  const envelope = type => encodeLanWirePacket({type, version:LAN_PROTOCOL_VERSION, roomId, peerId});
  const helloWire = envelope('hello');
  const leaveWire = envelope('leave');
  let disposed = false;
  let helloSent = false;
  let nextSequence = 0;
  function transmit(wire) {
    if (disposed || channel.readyState !== 'open') return false;
    try { channel.send(wire); return true; }
    catch { return false; }
  }
  function hello() {
    if (helloSent) return true;
    if (!transmit(helloWire)) return false;
    helloSent = true;
    return true;
  }
  function sendInput(buttons, axis) {
    if (!helloSent || disposed || nextSequence >= Number.MAX_SAFE_INTEGER) return false;
    const wire = encodeLanWirePacket({
      type:'input', version:LAN_PROTOCOL_VERSION, roomId, peerId, sequence:nextSequence, buttons, axis
    });
    if (!transmit(wire)) return false;
    nextSequence++;
    return true;
  }
  function leave() {
    if (!helloSent || !transmit(leaveWire)) return false;
    helloSent = false;
    return true;
  }
  function onClose() { helloSent = false; }
  function dispose() {
    if (disposed) return;
    leave();
    disposed = true;
    channel.removeEventListener('open', hello);
    channel.removeEventListener('close', onClose);
  }
  channel.addEventListener('open', hello);
  channel.addEventListener('close', onClose);
  if (channel.readyState === 'open') hello();
  return Object.freeze({
    hello, sendInput, leave, dispose,
    get helloSent() { return helloSent; },
    get nextSequence() { return nextSequence; }
  });
}

export {bindLanHostChannel, bindLanGuestChannel};
