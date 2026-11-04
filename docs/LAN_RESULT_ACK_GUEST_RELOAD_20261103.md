# LAN guest reload after durable result receipt, before ACK — 3 November 2026

## Result: local Chromium/WebRTC acceptance passed

Two local Chromium contexts use the candidate game, localhost signaling broker, and actual WebRTC DataChannels. At the guest's first result-ACK send, the harness verifies that the local wallet already contains exactly one receipt, closes the DataChannel, and immediately reloads the guest page before any ACK reaches the host. After the host's bounded fallback pays, the guest page is reloaded again to verify the saved wallet survived.

Command:

```powershell
$env:SMF_ACK_BROWSER_RELOAD_BEFORE_ACK='1'
python -X utf8 tests/lan_token_result_ack_guest_reload_browser_qa.py
```

Observed on candidate `0.12.81.0`:

- Guest receipt and 20-token balance were saved before the first page reload; the matching ACK was interrupted before DataChannel send.
- Host received zero ACKs and wrote one receipt via fallback **3039.0 ms** after the terminal snapshot.
- After the fallback, a second guest reload retained exactly one matching receipt and the 20-token balance. The host retained one receipt and 30 tokens.
- Normal guest directional input replicated before the result; no browser page errors occurred.

Validation passed:

- `SMF_ACK_BROWSER_RELOAD_BEFORE_ACK=1 python -X utf8 tests/lan_token_result_ack_guest_reload_browser_qa.py`
- `python -X utf8 -m py_compile tests/lan_token_result_ack_guest_reload_browser_qa.py`
- `git diff --check -- tests/lan_token_result_ack_guest_reload_browser_qa.py docs/LAN_RESULT_ACK_GUEST_RELOAD_20261103.md`

The localStorage wallet is local soft currency, not server-authenticated settlement. This verifies a controlled local browser reload before ACK send and another reload after fallback. It does not establish physical-device behavior, internet/NAT traversal, hosted operations, persistent storage corruption, or independent-device/network settlement.
