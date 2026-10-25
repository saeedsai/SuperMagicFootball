// LAN room discovery protocol foundation. Transport and LAN-local authorization are
// enforced by the discovery service, not by this client-side validation module.
export const LAN_ROOM_PROTOCOL_VERSION = 1;
const ID = /^[a-zA-Z0-9_-]{8,64}$/;
const NAME_MAX = 48;
const TYPES = new Set(['room-announce','room-remove','join-request','join-accept','join-reject']);

export function validateLanRoomMessage(message) {
  if (!message || typeof message !== 'object' || Array.isArray(message)) return null;
  if (message.version !== LAN_ROOM_PROTOCOL_VERSION || !TYPES.has(message.type)) return null;
  if (typeof message.roomId !== 'string' || !ID.test(message.roomId)) return null;
  const result = { version: LAN_ROOM_PROTOCOL_VERSION, type: message.type, roomId: message.roomId };
  if (message.type === 'room-announce') {
    if (typeof message.name !== 'string' || !message.name.trim() || message.name.length > NAME_MAX) return null;
    if (!Number.isSafeInteger(message.players) || message.players < 1 || message.players > 2) return null;
    result.name = message.name.trim();
    result.players = message.players;
  }
  if (message.type.startsWith('join-')) {
    if (typeof message.requestId !== 'string' || !ID.test(message.requestId)) return null;
    result.requestId = message.requestId;
  }
  return Object.freeze(result);
}

export function createLanRoomMessage(type, roomId, fields = {}) {
  const validated = validateLanRoomMessage({ ...fields, version: LAN_ROOM_PROTOCOL_VERSION, type, roomId });
  if (!validated) throw new TypeError('Invalid LAN room message');
  return validated;
}
