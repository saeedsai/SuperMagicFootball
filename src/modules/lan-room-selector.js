// Presentation-only selector for the LAN room browser. Trust and network
// isolation must be established by the discovery/signaling service.
export function selectJoinableLanRooms(rooms, { ownRoomId = null, search = '' } = {}) {
  if (!Array.isArray(rooms)) throw new TypeError('Rooms must be an array');
  if (typeof search !== 'string') throw new TypeError('Search must be a string');
  const query = search.trim().toLocaleLowerCase();
  return rooms.filter(room =>
    room && typeof room.roomId === 'string' &&
    room.roomId !== ownRoomId && room.players === 1 &&
    typeof room.name === 'string' && room.name.toLocaleLowerCase().includes(query)
  ).map(room => Object.freeze({ roomId: room.roomId, name: room.name, players: room.players }));
}
