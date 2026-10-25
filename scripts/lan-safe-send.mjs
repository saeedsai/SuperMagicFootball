// A failed signaling write must not crash the LAN companion server or retain a ghost seat.
export function safeLanSend(ws, message) {
  if (!ws || ws.readyState !== 1) return false;
  try {
    const payload = JSON.stringify(message);
    if (typeof payload !== 'string') return false;
    ws.send(payload, error => {
      if (error) { try { ws.terminate?.(); } catch { /* already closing */ } }
    });
    return true;
  } catch {
    try { ws.terminate?.(); } catch { /* already closing */ }
    return false;
  }
}
