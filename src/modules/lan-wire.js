// Bounded JSON wire format for a future WebRTC LAN data channel.
// Transport-independent: does not create a connection or synchronize gameplay.
import {LAN_PROTOCOL_VERSION, LAN_BUTTONS} from './lan-session.js';

const LAN_MAX_WIRE_BYTES = 512;
const ID = /^[a-zA-Z0-9_-]{6,32}$/;
const plain = value => value !== null && typeof value === 'object' &&
  !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const exactKeys = (value, names) => plain(value) &&
  Object.keys(value).length === names.length &&
  names.every(name => Object.hasOwn(value, name));
const encoder = new TextEncoder();

function validateWirePacket(packet) {
  if (!plain(packet) || !['hello', 'leave', 'input'].includes(packet.type) ||
      packet.version !== LAN_PROTOCOL_VERSION ||
      (typeof packet.roomId !== 'string' || !ID.test(packet.roomId)) ||
      (typeof packet.peerId !== 'string' || !ID.test(packet.peerId))) {
    throw new TypeError('Invalid LAN wire envelope');
  }
  const base = ['type', 'version', 'roomId', 'peerId'];
  if (packet.type !== 'input') {
    if (!exactKeys(packet, base)) throw new TypeError('Unexpected LAN lifecycle fields');
    return Object.freeze({
      type: packet.type, version: LAN_PROTOCOL_VERSION,
      roomId: packet.roomId, peerId: packet.peerId
    });
  }
  if (!exactKeys(packet, [...base, 'sequence', 'buttons', 'axis']) ||
      !Number.isSafeInteger(packet.sequence) || packet.sequence < 0 ||
      !exactKeys(packet.buttons, LAN_BUTTONS) ||
      !LAN_BUTTONS.every(name => typeof packet.buttons[name] === 'boolean') ||
      !exactKeys(packet.axis, ['x', 'y']) ||
      !['x', 'y'].every(name => Number.isFinite(packet.axis[name]) &&
        packet.axis[name] >= -1 && packet.axis[name] <= 1)) {
    throw new TypeError('Invalid LAN wire input');
  }
  return Object.freeze({
    type: 'input', version: LAN_PROTOCOL_VERSION,
    roomId: packet.roomId, peerId: packet.peerId, sequence: packet.sequence,
    buttons: Object.freeze(Object.fromEntries(LAN_BUTTONS.map(name => [name, packet.buttons[name]]))),
    axis: Object.freeze({x: packet.axis.x, y: packet.axis.y})
  });
}

function encodeLanWirePacket(packet) {
  const encoded = JSON.stringify(validateWirePacket(packet));
  if (encoder.encode(encoded).byteLength > LAN_MAX_WIRE_BYTES) {
    throw new RangeError('LAN wire packet exceeds maximum size');
  }
  return encoded;
}

function decodeLanWirePacket(data) {
  if (typeof data !== 'string' ||
      encoder.encode(data).byteLength > LAN_MAX_WIRE_BYTES) {
    throw new TypeError('Invalid LAN wire data size or type');
  }
  let parsed;
  try { parsed = JSON.parse(data); }
  catch { throw new TypeError('Invalid LAN wire JSON'); }
  return validateWirePacket(parsed);
}

export {LAN_MAX_WIRE_BYTES, encodeLanWirePacket, decodeLanWirePacket};
