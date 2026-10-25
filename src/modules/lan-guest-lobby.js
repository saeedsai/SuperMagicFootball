import { createLanRoomMessage, validateLanRoomMessage } from './lan-room-protocol.js';

// Guest-side host-consent handshake. A request ID must be generated with
// cryptographic randomness by the caller. The signaling transport must bind
// decisions to the authenticated host; matching IDs alone are not security.
export function createLanGuestLobby({ roomId, requestId, ttlMs = 30000, now = () => Date.now() } = {}) {
  const requestPacket = createLanRoomMessage('join-request', roomId, { requestId });
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1000 || ttlMs > 120000) throw new RangeError('Invalid request TTL');
  if (typeof now !== 'function') throw new TypeError('Invalid clock');
  let phase = 'idle';
  let expiresAt = null;
  const expire = () => {
    if (phase === 'pending' && now() >= expiresAt) phase = 'expired';
  };
  return Object.freeze({
    request() {
      expire();
      if (phase !== 'idle') return null;
      const started = now();
      if (!Number.isFinite(started) || started < 0) return null;
      expiresAt = started + ttlMs;
      phase = 'pending';
      return requestPacket;
    },
    receive(packet) {
      expire();
      if (phase !== 'pending') return false;
      const message = validateLanRoomMessage(packet);
      if (!message || (message.type !== 'join-accept' && message.type !== 'join-reject')) return false;
      if (message.roomId !== roomId || message.requestId !== requestId) return false;
      phase = message.type === 'join-accept' ? 'accepted' : 'rejected';
      return true;
    },
    status() { expire(); return phase; },
    cancel() {
      expire();
      if (phase !== 'pending') return false;
      phase = 'cancelled';
      return true;
    }
  });
}
