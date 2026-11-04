import { validateLanRoomMessage } from './lan-room-protocol.js';

// Host-side consent queue. Authentication and LAN isolation belong to signaling.
// Bounded pending and replay tables limit duplicate prompts and memory growth.
export function createLanJoinRequests({
  roomId, ttlMs = 30000, maxPending = 8, maxRemembered = 64, now = () => Date.now()
} = {}) {
  if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{8,64}$/.test(roomId)) throw new TypeError('Invalid room ID');
  if (typeof now !== 'function') throw new TypeError('now must be a function');
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1000 || ttlMs > 120000) throw new RangeError('Invalid request TTL');
  if (!Number.isSafeInteger(maxPending) || maxPending < 1 || maxPending > 32) throw new RangeError('Invalid pending limit');
  if (!Number.isSafeInteger(maxRemembered) || maxRemembered < maxPending || maxRemembered > 512) throw new RangeError('Invalid replay limit');
  const pending = new Map();
  const remembered = new Map();
  const prune = (time = now()) => {
    for (const [id, request] of pending) if (request.expiresAt <= time) pending.delete(id);
    for (const [id, expiresAt] of remembered) if (expiresAt <= time) remembered.delete(id);
  };
  return Object.freeze({
    receive(packet) {
      const message = validateLanRoomMessage(packet);
      if (!message || message.type !== 'join-request' || message.roomId !== roomId) return false;
      // Use one timestamp for pruning and expiry. An unstable or unsafe clock
      // must not extend consent or replay suppression beyond the configured TTL.
      const time = now();
      const expiresAt = time + ttlMs;
      if (!Number.isSafeInteger(time) || !Number.isSafeInteger(expiresAt)) return false;
      prune(time);
      if (remembered.has(message.requestId) || pending.size >= maxPending || remembered.size >= maxRemembered) return false;
      pending.set(message.requestId, { requestId: message.requestId, expiresAt });
      remembered.set(message.requestId, expiresAt);
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
    clear() { pending.clear(); remembered.clear(); }
  });
}
