# LAN result ACK send-refusal retry — 3 November 2026

## Result: local Chromium/WebRTC acceptance passed

Extended `tests/lan_token_result_ack_browser_qa.py` with a dedicated refusal mode. The guest uses a real Chromium `RTCDataChannel` connected through the local signaling broker; its first `send()` for the durable `result-ack` receipt throws an `OperationError`. The harness then allows the next send and observes the repeated terminal snapshot from the host.

Command:

```powershell
$env:SMF_ACK_BROWSER_REFUSE_ONCE='1'
python -X utf8 tests/lan_token_result_ack_browser_qa.py
```

Observed on candidate `0.12.81.0`:

- Guest ACK send refusal: **1**.
- Successful retry: same room/host/match receipt ID; one successful ACK send followed the refusal **0.5 ms** later.
- Host wallet write followed receipt of the matching ACK by **1.0 ms**, before the 3-second fallback.
- Host and guest each persisted exactly one receipt and retained expected local rewards (30 and 20 tokens).
- Duplicate finished snapshots were observed; normal guest directional input still replicated over the same real DataChannel.
- No product source change was needed; existing durable receipt and repeated-snapshot retry behavior passed this transport-refusal case.

The test uses two local Chromium contexts and a localhost broker. It does not establish physical-device behavior, internet/NAT traversal, hosted service operation, packet loss, or server-secure token settlement.
