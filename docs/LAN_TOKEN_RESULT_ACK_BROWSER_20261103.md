# LAN-098 result ACK browser acceptance — 3 November 2026

## Result: local Chromium/WebRTC acceptance passed

The real two-browser test runs a local signaling broker and two Chromium contexts connected through actual WebRTC DataChannels. It reaches the normal engine finish event by shortening the live match clock through the public game object; it adds no production debug hook. The test first verifies guest directional input reaches the host, then checks terminal-receipt delivery, duplicate terminal snapshot idempotency, and the host's ACK-confirmed payout.

The first run against the original `.81` tree exposed a cleanup race: the host result screen closed its peer/DataChannel before the guest's ACK arrived. The UI now keeps the host match runtime only while a delivered terminal receipt has pending ACK status. Matching ACK confirmation or the existing 3 second timeout closes the runtime; navigating away, explicit rematch, page unload and transport errors still dispose immediately. Immediate disposal also cancels its pending fallback timer, so a delayed callback cannot award after a deliberate exit.

On the corrected `.81` source tree, `python -X utf8 tests/lan_token_result_ack_browser_qa.py` passed. The exact matching ACK reached the host over the real DataChannel, host wallet persistence followed receipt of the ACK by 1.0 ms, duplicate terminal snapshots were received, and each local wallet persisted one receipt (host 30 tokens, guest 20). Guest ArrowRight input also replicated normally before terminal result delivery.

The lost-ACK browser path passed with `SMF_ACK_BROWSER_DROP_ACK=1 python -X utf8 tests/lan_token_result_ack_browser_qa.py`. The browser harness drops guest ACK packets before DataChannel send, so the host receives none. It retained the result connection through the pending window, paid exactly once via fallback, and closed the host channel 3063.4 ms after the terminal snapshot. Each wallet retained one receipt. This verifies bounded UI cleanup as well as the deterministic fake-timer fallback in the Node suite.

Focused deterministic LAN-098 tests passed **6/6**, including stale/cross-match rejection, duplicate suppression, the exact 3000 ms `unconfirmed` timeout, and immediate disposal cancelling the pending timer without a delayed award. LAN/P2P suites passed **440/440**. `node --check` passed for both changed JavaScript modules; Python compilation and `git diff --check` passed.

These checks use two local browser contexts and a localhost signaling broker. They do not establish independent physical-device, internet/NAT, hosted-service, deployment, or human visual acceptance.

## Screenshots

![Host result screen after ACK confirmation](/D:/My%20Projects/Supermagic_Football/SuperMagicFootball/docs/LAN_TOKEN_RESULT_ACK_BROWSER_HOST_RESULT_20261103.png)

![Guest result screen after durable local receipt](/D:/My%20Projects/Supermagic_Football/SuperMagicFootball/docs/LAN_TOKEN_RESULT_ACK_BROWSER_GUEST_RESULT_20261103.png)

![Host result screen after lost-ACK bounded fallback](/D:/My%20Projects/Supermagic_Football/SuperMagicFootball/docs/LAN_TOKEN_RESULT_ACK_BROWSER_TIMEOUT_HOST_20261103.png)
