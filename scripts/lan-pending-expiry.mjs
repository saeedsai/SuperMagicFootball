// Expire unanswered guest join requests and clear the host's approval UI.
// Broker entries may use room-scoped composite keys; wire IDs live on each record.
export function expireLanPending(pending, send, now = Date.now(), ttlMs = 30000) {
  let expired = 0;
  for (const [pendingKey, request] of pending) {
    if (now - request.time <= ttlMs) continue;
    const requestId = request.requestId ?? pendingKey;
    pending.delete(pendingKey);
    send(request.guest, {type:'join-reject', roomId:request.roomId, requestId, reason:'timeout'});
    send(request.host, {type:'join-cancel', roomId:request.roomId, requestId, reason:'timeout'});
    expired++;
  }
  return expired;
}
