# LAN host token recovery after exhausted automatic saves — 3 November 2026

## Behavior

If both bounded automatic writes fail (the matching-ACK attempt and the existing three-second fallback attempt), the host stays on the Full Time screen. A polite live status explains that the local reward is unsaved and offers an accessible **RETRY TOKEN REWARD** button. Each button activation makes exactly one storage attempt; it does not start a retry timer. When storage recovers, the existing room/host/match receipt ID is saved once, the status becomes confirmed only after persistence succeeds, and the LAN result runtime closes. The receipt-ID guard prevents another click or duplicate ACK/snapshot from paying twice.

The final result and retry capability live in memory. Leaving the result page or reloading before the receipt is saved loses that unsaved host reward; there is no cross-reload recovery. The wallet remains local soft currency, not authenticated server settlement.

## Real-browser acceptance

Command:

```powershell
$env:SMF_ACK_BROWSER_FAIL_HOST_WALLET_WRITES='2'
python -X utf8 tests/lan_token_result_ack_host_write_retry_browser_qa.py
```

Local Chromium/WebRTC passed on candidate `0.12.81.2`: two injected automatic host-wallet write failures; the recovery status and button appeared while the match result remained available; keyboard Enter activated the retry; one host receipt write then succeeded. Host and guest each retained exactly one receipt (30 and 20 tokens respectively). Duplicate ACKs did not double-credit, result channels were closed, and there were no page errors.

Focused state/duplicate suite passed **47/47**:

```powershell
node --test tests/lan-token-result-ack-recovery.test.cjs tests/lan-token-result-ack.test.cjs tests/lan_live_match.test.cjs
```

Full LAN/P2P Node suite passed **444/444**:

```powershell
node --test tests/lan*.test.cjs tests/lan-*.test.cjs tests/p2p*.test.cjs
```

`node --check` passed for `src/modules/lan-live-match.js` and `src/modules/ui.js`; Python compilation and targeted `git diff --check` passed.

This is local browser evidence only. It does not establish physical-device behavior, independent network/NAT paths, hosted operation, or server-authenticated token settlement.
