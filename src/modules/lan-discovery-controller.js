import { createLanRoomDirectory } from './lan-room-directory.js';
import { createLanRoomMessage } from './lan-room-protocol.js';

// Client orchestration only. A trusted signaling service must authenticate peers,
// scope rooms to a verified LAN and deliver discovery events over a secure channel.
export function createLanDiscoveryController({ send, now = () => Date.now(), ttlMs = 15000 } = {}) {
  if (typeof send !== 'function') throw new TypeError('send must be a function');
  const directory = createLanRoomDirectory({ now, ttlMs });
  let hosted = null;
  let closed = false;
  const ensureOpen = () => { if (closed) throw new Error('LAN discovery controller closed'); };
  return Object.freeze({
    host(roomId, name) {
      ensureOpen();
      const packet = createLanRoomMessage('room-announce', roomId, { name, players: 1 });
      send(packet);
      hosted = packet;
      return packet;
    },
    heartbeat() {
      ensureOpen();
      if (!hosted) return false;
      send(hosted);
      return true;
    },
    stopHosting() {
      ensureOpen();
      if (!hosted) return false;
      const packet = createLanRoomMessage('room-remove', hosted.roomId);
      send(packet);
      hosted = null;
      return true;
    },
    receive(packet) {
      if (closed) return false;
      return directory.receive(packet);
    },
    rooms() { return closed ? [] : directory.list(); },
    close() {
      if (closed) return;
      closed = true;
      hosted = null;
      directory.clear();
    }
  });
}
