# LAN result ACK recovery after wallet write refusal — 3 November 2026

## Result: local Chromium/WebRTC acceptance passed

This test uses the actual app build, two local Chromium contexts, a localhost signaling broker, and real WebRTC DataChannels. The host completes a normal Quick Match result; the guest's first attempt to persist its LAN result receipt is refused with a one-shot `QuotaExceededError` before the browser writes it to localStorage. The next repeated terminal snapshot retries the wallet write.

Command:

```powershell
$env:SMF_ACK_BROWSER_FAIL_WALLET_WRITE_ONCE='1'
python -X utf8 tests/lan_token_result_ack_storage_retry_browser_qa.py
```

Observed on candidate `0.12.81.0`:

- Exactly one guest wallet write was refused; no receipt was persisted by that attempt.
- No ACK was sent before the guest's receipt was durably written.
- A later repeated finished snapshot successfully persisted the same receipt and sent its matching ACK over WebRTC.
- The host received that ACK and wrote the matching receipt before the 3-second fallback; the host's wallet was paid once.
- Guest and host each retained exactly one receipt and the expected balances (20 and 30 tokens). Normal guest directional input also replicated over the same channel.
- The test completed with no browser page errors.

Validation passed:

- `SMF_ACK_BROWSER_FAIL_WALLET_WRITE_ONCE=1 python -X utf8 tests/lan_token_result_ack_storage_retry_browser_qa.py`
- `python -X utf8 -m py_compile tests/lan_token_result_ack_storage_retry_browser_qa.py`
- `git diff --check -- tests/lan_token_result_ack_storage_retry_browser_qa.py`

No product-source change was needed. This verifies a controlled one-time browser storage exception followed by recovery on a duplicate terminal snapshot. It does not establish persistent quota exhaustion behavior, physical-device reliability, internet/NAT traversal, hosted service operation, or authenticated server-side token settlement.
