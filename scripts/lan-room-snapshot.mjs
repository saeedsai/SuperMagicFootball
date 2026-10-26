// Authoritative scoped directory response for periodic Find Games refresh.
// An empty list removes stale room cards missed during disconnect or broadcast loss.
export function lanRoomSnapshot(rooms, viewerIp, visible, scope='lan') {
  if (typeof visible !== 'function') throw new TypeError('Network visibility predicate required');
  const listed = [];
  for (const room of rooms.values()) {
    if ((room.scope??'lan')!==scope) continue;
    if(scope==='lan'&&!visible(viewerIp, room.ip))continue;
    listed.push({roomId: room.id, name: room.name, build: room.build, full: !!room.guest,
      ...(scope==='internet-p2p'?{scope}:{})});
  }
  return {type: 'rooms-snapshot', rooms: listed};
}
