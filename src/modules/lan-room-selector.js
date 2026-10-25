// Presentation-only selector for the LAN room browser. Trust and network
// isolation must be established by the discovery/signaling service.
export function selectJoinableLanRooms(rooms, { ownRoomId = null, search = '' } = {}) {
  if (!Array.isArray(rooms)) throw new TypeError('Rooms must be an array');
  if (typeof search !== 'string') throw new TypeError('Search must be a string');
  const query = search.trim().toLocaleLowerCase();
  const seen = new Set();
  const selected = [];
  for (const room of rooms) {
    if (!room || typeof room.roomId !== 'string' || seen.has(room.roomId) ||
        room.roomId === ownRoomId || room.players !== 1 ||
        typeof room.name !== 'string' || !room.name.toLocaleLowerCase().includes(query)) continue;
    seen.add(room.roomId);
    selected.push(Object.freeze({ roomId: room.roomId, name: room.name, players: room.players }));
  }
  return selected;
}
