// Remove a departing guest's pending requests and approved room seat.
// Identity is the authenticated WebSocket object, never a client-supplied ID.
export function releaseLanGuest(ws, rooms, pending, send) {
  let cancelled = 0, released = 0;
  for (const [requestId, request] of pending) {
    if (request.guest !== ws) continue;
    pending.delete(requestId);
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
