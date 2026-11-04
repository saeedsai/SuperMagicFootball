# LAN ACK host-wallet persistence retry gap — 3 November 2026

## Reproduced in local Chromium/WebRTC

`repro_host_wallet_write_failure.py` runs two Chromium contexts through the local signaling broker and real WebRTC DataChannels. After the guest durably saves its receipt, the host browser's first attempt to write the matching receipt throws an injected one-shot `QuotaExceededError`. The guest sends the exact valid ACK. The host wallet is then inspected after the result channels close.

Command:

```powershell
$env:SMF_ACK_BROWSER_FAIL_HOST_WALLET_ONCE='1'
python -X utf8 references/analysis/lan_ack_host_wallet_failure_20261103/repro_host_wallet_write_failure.py
```

Observed diagnostic:

```text
LAN098_HOST_WALLET_FAILURE_DIAGNOSTIC host_ack_count=2 injected_write_failures=1 host_durable_receipt_writes=0 guest_durable_receipt_writes=1 host_receipt_count=0 guest_receipt_count=1 host_tokens=0 guest_tokens=20 host_result_channels_closed=true page_errors=0
LAN098_HOST_WALLET_RETRY_GAP_REPRODUCED: ACK confirmation closed the result runtime after one failed host wallet write; no later retry persisted the host receipt
```

The host saw duplicate ACKs because the browser harness retransmits the terminal snapshot; the first matching ACK changes lifecycle status to `confirmed`, the failed host persistence leaves no host receipt, and the result runtime then closes without a later write retry. The guest retains exactly one receipt. No product code was changed in this diagnostic.

This is a transient one-shot local browser-storage failure. It does not establish behavior under persistent quota exhaustion, physical devices, independent network paths or server-authenticated settlement.
