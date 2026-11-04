# LAN30 browser input refusal/retry acceptance — 3 November 2026

## Scope

The local two-browser Chromium/WebRTC acceptance now forces one guest `RTCDataChannel.send()` to throw for a JUMP input after the real host/guest match is ready. The next retry preserves the same sequence and JUMP action, and the host-side channel observer sees that sequence exactly once. In the observed run the retried frame was also 14, equal to the refused frame 14: the live input frame had not advanced, so the current safe target remained unchanged. This verifies transport binding and retry delivery through a real local peer pair.

The browser assertion does not claim that the engine applied the Jump. Engine input application, one-shot edge retention, frame safety and bounded retry behavior remain covered by the deterministic LAN-092 tests.

## Validation

- Portable Chromium two-browser run: **PASS**. It also passed the existing local ownership/replication, synthetic ICE state-recovery, broker-shutdown and visible-render checks. The refusal run reported sequence 10, frame 14 → 14, and one host-observed packet with the retried sequence/action.
- `node --test tests/lan_live_match.test.cjs`: **40/40 passed**, including LAN-092 edge retry/rebase and expiry cases.
- `git diff --check`: passed; Python syntax compilation passed.

The broker and both peers ran locally. Synthetic ICE state transitions did not drop DataChannel packets. This does not verify hosted service, NAT traversal, real packet loss, physical devices or two-device network conditions.
