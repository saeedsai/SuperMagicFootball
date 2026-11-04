# LAN result-channel close before guest ACK — 3 November 2026

## Result: local Chromium/WebRTC acceptance passed

Two local Chromium contexts run the candidate game through the localhost LAN signaling broker and actual WebRTC DataChannels. After guest input replication and a normal finished match snapshot, the guest persists its result receipt. The browser harness then closes the guest's real DataChannel immediately before it can send the result ACK. No ACK reaches the host. The existing 3-second fallback should pay the host exactly once, then dispose the pending result runtime.

Command:

```powershell
$env:SMF_ACK_BROWSER_CLOSE_BEFORE_ACK='1'
python -X utf8 tests/lan_token_result_ack_disconnect_browser_qa.py
```

Observed on candidate `0.12.81.0`:

- Guest local receipt was durably stored before the injected channel close.
- Guest attempted one matching ACK; the channel closed before transport send, and the host received zero ACKs.
- The host persisted its matching receipt **3060.1 ms** after the first terminal snapshot, consistent with the bounded 3-second fallback under browser scheduling.
- Host and guest each retained one receipt with the expected local rewards (30 and 20 tokens).
- The result runtime closed after fallback; normal guest directional input had replicated before the terminal close, and neither browser reported a page error.

This case covers a local channel close in the narrow window after guest persistence but before ACK delivery. It does not test peer reconnection during a finished result, physical devices, internet/NAT, hosted operation, persistent transport loss, or authenticated server-side token settlement.
