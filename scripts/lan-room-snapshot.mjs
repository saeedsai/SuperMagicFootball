// Authoritative scoped directory response for periodic Find Games refresh.
// An empty list removes stale room cards missed during disconnect or broadcast loss.
export function lanRoomSnapshot(rooms, viewerIp, visible) {
  if (typeof visible !== 'function') throw new TypeError('Network visibility predicate required');
  const listed = [];
  for (const room of rooms.values()) {
    if (!visible(viewerIp, room.ip)) continue;
    listed.push({roomId: room.id, name: room.name, build: room.build, full: !!room.guest});
  }
  return {type: 'rooms-snapshot', rooms: listed};
}
