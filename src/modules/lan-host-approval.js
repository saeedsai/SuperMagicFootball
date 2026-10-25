import { createLanRoomMessage, validateLanRoomMessage } from './lan-room-protocol.js';

// Host-side consent queue only. The signaling service MUST authenticate sender
// identity, enforce LAN scope, and bind responses to the originating peer.
// These client-side checks are not an authorization or identity mechanism.
export function createLanHostApproval({ send, now = () => Date.now(), ttlMs = 30000, maxPending = 8 } = {}) {
  if (typeof send !== 'function') throw new TypeError('send must be a function');
  if (typeof now !== 'function') throw new TypeError('now must be a function');
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1000 || ttlMs > 120000) throw new RangeError('Invalid request TTL');
  if (!Number.isSafeInteger(maxPending) || maxPending < 1 || maxPending > 32) throw new RangeError('Invalid pending limit');
  let hostedRoomId = null;
  let closed = false;
  const pending = new Map();
  const decided = new Map();
  const ensureOpen = () => { if (closed) throw new Error('LAN host approval closed'); };
  const prune = () => {
    const time = now();
    for (const [id, entry] of pending) if (entry.expiresAt <= time) pending.delete(id);
    for (const [id, expiresAt] of decided) if (expiresAt <= time) decided.delete(id);
  };
  return Object.freeze({
    start(roomId) {
      ensureOpen();
      // Use the canonical packet validator to reject malformed room IDs.
      createLanRoomMessage('room-remove', roomId);
      hostedRoomId = roomId;
      pending.clear();
      decided.clear();
      return roomId;
    },
    receive(packet) {
      if (closed || !hostedRoomId) return false;
      const message = validateLanRoomMessage(packet);
      if (!message || message.type !== 'join-request' || message.roomId !== hostedRoomId) return false;
      prune();
      if (pending.has(message.requestId) || decided.has(message.requestId) || pending.size >= maxPending) return false;
      pending.set(message.requestId, { requestId: message.requestId, expiresAt: now() + ttlMs });
      return true;
    },
    pendingRequests() {
      prune();
      return closed ? [] : Array.from(pending.keys());
    },
    respond(requestId, accept) {
      ensureOpen();
      if (typeof accept !== 'boolean') throw new TypeError('accept must be boolean');
      prune();
      if (!pending.has(requestId)) return false;
      const packet = createLanRoomMessage(accept ? 'join-accept' : 'join-reject', hostedRoomId, { requestId });
      // Do not consume a request if the transport failed to deliver the decision.
      send(packet);
      pending.delete(requestId);
      decided.set(requestId, now() + ttlMs);
      return packet;
    },
    stop() {
      ensureOpen();
      hostedRoomId = null;
      pending.clear();
      decided.clear();
    },
    close() {
      if (closed) return;
      hostedRoomId = null;
      pending.clear();
      decided.clear();
      closed = true;
    }
  });
}
