// Remove a departing guest's pending requests and approved room seat.
// Identity is the authenticated WebSocket object, never a client-supplied ID.
// Wire request IDs are read from entries so internal map keys may be composite.
export function releaseLanGuest(ws, rooms, pending, send) {
  let cancelled = 0, released = 0;
  for (const [pendingKey, request] of pending) {
    if (request.guest !== ws) continue;
    const requestId = request.requestId ?? pendingKey;
    pending.delete(pendingKey);
    send(request.host, {type:'join-cancel', roomId:request.roomId, requestId});
    cancelled++;
  }
  for (const room of rooms.values()) {
    if (room.guest !== ws) continue;
    room.guest = null;
    send(room.host, {type:'guest-left', roomId:room.id});
    released++;
  }
  return {cancelled, released};
}
