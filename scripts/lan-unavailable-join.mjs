// Reply to a join for a vanished or invisible room without revealing room visibility.
export function rejectUnavailableJoin(ws, message, send) {
  if (message?.type !== 'join' || typeof message.requestId !== 'string' || !/^[a-zA-Z0-9_-]{8,64}$/.test(message.requestId)) return false;
  return send(ws, {type:'join-reject', roomId:typeof message.roomId==='string'?message.roomId:undefined, requestId:message.requestId, reason:'room-unavailable'});
}
