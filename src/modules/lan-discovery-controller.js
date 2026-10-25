import { createLanRoomDirectory } from './lan-room-directory.js';
import { createLanRoomMessage } from './lan-room-protocol.js';
import { selectJoinableLanRooms } from './lan-room-selector.js';

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
      // Announce the new room first: a failed transport send must not
      // silently discard the previously hosted room.
      send(packet);
      if (hosted && hosted.roomId !== roomId) {
        try { send(createLanRoomMessage('room-remove', hosted.roomId)); }
        catch (_) { /* Old room will expire when its heartbeat stops. */ }
      }
      hosted = packet;
      return packet;
    },
    // Advertise approved guest occupancy; this does not grant admission.
    setPlayers(players) {
      ensureOpen();
      if (!hosted) return false;
      const packet = createLanRoomMessage('room-announce', hosted.roomId, {
        name: hosted.name, players
      });
      if (packet.players === hosted.players) return false;
      send(packet);
      hosted = packet;
      return true;
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
      hosted = null;
      try { send(packet); }
      catch (_) { /* Stale listing expires without heartbeat. */ }
      return true;
    },
    receive(packet) {
      if (closed) return false;
      return directory.receive(packet);
    },
    rooms() { return closed ? [] : directory.list(); },
    // Live, TTL-pruned candidates for Find Games. Admission remains host-approved.
    joinableRooms(search = '') {
      return selectJoinableLanRooms(closed ? [] : directory.list(), {
        ownRoomId: hosted?.roomId ?? null, search
      });
    },
    close() {
      if (closed) return;
      const lastHosted = hosted;
      closed = true;
      hosted = null;
      directory.clear();
      if (lastHosted) {
        try { send(createLanRoomMessage('room-remove', lastHosted.roomId)); }
        catch (_) { /* TTL expiry removes the stale listing. */ }
      }
    }
  });
}
