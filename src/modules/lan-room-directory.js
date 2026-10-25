import { validateLanRoomMessage } from './lan-room-protocol.js';

// Client-side room list. Network authorization must be enforced by the signaling service.
export function createLanRoomDirectory({ ttlMs = 15000, now = () => Date.now() } = {}) {
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1000 || ttlMs > 120000) throw new RangeError('Invalid room TTL');
  const rooms = new Map();
  const MAX_ROOMS = 128;
  // A room that was removed must not remain visible in a cached browser list.
  const prune = () => {
    const time = now();
    for (const [id, room] of rooms) if (room.expiresAt <= time) rooms.delete(id);
  };
  return Object.freeze({
    receive(packet) {
      const message = validateLanRoomMessage(packet);
      if (!message || !['room-announce', 'room-remove'].includes(message.type)) return false;
      prune();
      if (message.type === 'room-remove') rooms.delete(message.roomId);
      else {
        if (!rooms.has(message.roomId) && rooms.size >= MAX_ROOMS) return false;
        rooms.set(message.roomId, { ...message, expiresAt: now() + ttlMs });
      }
      return true;
    },
    list() {
      prune();
      return Array.from(rooms.values(), ({ expiresAt, ...room }) => Object.freeze(room))
        .sort((a, b) => a.name.localeCompare(b.name) || a.roomId.localeCompare(b.roomId));
    },
    clear() { rooms.clear(); }
  });
}
