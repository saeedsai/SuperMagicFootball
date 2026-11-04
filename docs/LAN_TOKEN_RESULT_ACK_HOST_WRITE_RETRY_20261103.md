# LAN host result-receipt persistence retry — 3 November 2026

## Defect and correction

A real two-browser Chromium/WebRTC diagnostic injected one `QuotaExceededError` into host wallet persistence after the guest had saved its receipt and sent a valid result ACK. Before the fix, the host marked the ACK confirmed, cleared its result timer, then closed the result runtime without a durable receipt; the guest retained 20 tokens and the host remained at 0. The pre-fix reproduction is preserved at [`references/analysis/lan_ack_host_wallet_failure_20261103/README.md`](../references/analysis/lan_ack_host_wallet_failure_20261103/README.md).

In candidate 0.12.81.1, guest ACK receipt and host wallet settlement are separate states. The host attempts persistence on a matching ACK; a failed write leaves the existing 3-second result timer pending for one retry. The host exposes `confirmed` only after the receipt is durably saved. Duplicate ACKs do not trigger repeated immediate writes. Total host attempts are capped at two, including the no-ACK fallback.

## Validation

- `python -X utf8 scripts/build.py` — passed; 4,974,258 JavaScript characters and 5,068,736 HTML fixture characters.
- `node --test tests/*.test.cjs` — **1,938/1,938** passed.
- `node --test tests/lan*.test.cjs tests/p2p*.test.cjs` — **443/443** passed.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs` — **21/21** passed.
- `node tests/v08245_release_alignment.mjs` — **136 checks** passed at 0.12.81.1.
- Local Chromium/WebRTC injected host-wallet failure: one failure, one bounded retry at 2,969.1 ms, one durable receipt per wallet, host 30 tokens/guest 20 tokens, result channels closed, and zero page errors.
- On 0.12.81.1, default ACK, guest storage-refusal retry, result-channel-close fallback and guest reload after saving an unacknowledged receipt also passed. The storage-refusal browser test timed out during a parallel run, then passed when rerun alone; the harness uses a short 5-second ACK observation window.
- `node --check src/modules/lan-live-match.js` and Python compilation of the five ACK browser scripts passed.

## Limits and remaining recovery policy

This is local Chromium with a localhost signaling broker and WebRTC channels. It does not validate hosted service, Internet/NAT traversal, independent devices, or an authenticated server ledger. If both bounded host storage attempts fail, the receipt remains unconfirmed and no durable host payout is claimed; persistent quota failure and user-facing recovery remain open.
