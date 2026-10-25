// Expire unanswered guest join requests and clear the host's approval UI.
// Pending entries are keyed by request ID and bound to their WebSocket objects.
export function expireLanPending(pending, send, now = Date.now(), ttlMs = 30000) {
  let expired = 0;
  for (const [requestId, request] of pending) {
    if (now - request.time <= ttlMs) continue;
    pending.delete(requestId);
    send(request.guest, {type:'join-reject', roomId:request.roomId, requestId, reason:'timeout'});
    send(request.host, {type:'join-cancel', roomId:request.roomId, requestId, reason:'timeout'});
    expired++;
  }
  return expired;
}
