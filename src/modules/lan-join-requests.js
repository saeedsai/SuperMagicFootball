import { validateLanRoomMessage } from './lan-room-protocol.js';

// Host-side consent state. The signaling server must authenticate both peers,
// restrict rooms to the same authorized LAN and relay decisions to the requester.
export function createLanJoinRequests({ roomId, ttlMs = 30000, now = () => Date.now() } = {}) {
  if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{8,64}$/.test(roomId)) throw new TypeError('Invalid room ID');
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1000 || ttlMs > 120000) throw new RangeError('Invalid request TTL');
  const pending = new Map();
  const prune = () => {
    const time = now();
    for (const [id, request] of pending) if (request.expiresAt <= time) pending.delete(id);
  };
  return Object.freeze({
    receive(packet) {
      const message = validateLanRoomMessage(packet);
      if (!message || message.type !== 'join-request' || message.roomId !== roomId) return false;
      prune();
      if (pending.has(message.requestId)) return false;
      pending.set(message.requestId, { requestId: message.requestId, expiresAt: now() + ttlMs });
      return true;
    },
    list() {
      prune();
      return Array.from(pending.values(), ({ requestId }) => Object.freeze({ requestId }));
    },
    decide(requestId, accept) {
      prune();
      if (!pending.has(requestId) || typeof accept !== 'boolean') return null;
      pending.delete(requestId);
      return Object.freeze({ version: 1, type: accept ? 'join-accept' : 'join-reject', roomId, requestId });
    },
    clear() { pending.clear(); }
  });
}
