// A failed signaling write must not crash the LAN companion server or retain a ghost seat.
export function safeLanSend(ws, message) {
  if (!ws || ws.readyState !== 1) return false;
  try {
    const payload = JSON.stringify(message);
    if (typeof payload !== 'string') return false;
    // A valid signaling envelope is always a JSON object with a message type.
    if (!message || typeof message !== 'object' || Array.isArray(message) || typeof message.type !== 'string') return false;
    // Bound outbound signaling to the same frame budget enforced on inbound messages.
    if (Buffer.byteLength(payload, 'utf8') > 210000) return false;
    // Recheck state after serialization, which may invoke custom toJSON code.
    if (ws.readyState !== 1) return false;
    ws.send(payload, error => {
      if (error) { try { ws.terminate?.(); } catch { /* already closing */ } }
    });
    return true;
  } catch {
    try { ws.terminate?.(); } catch { /* already closing */ }
    return false;
  }
}
