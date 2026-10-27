# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`  
**Updated:** 2026-10-27

## Mission
Continue bounded tested increments directly on dev despite pending releases; exact-head green protected promotion only. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, saves and offline.

## Current checkpoint
- 0.11.4.4 candidate: hosted secure signaling WebSocket watchdog 60s for Render cold starts; local same-origin LAN remains 12s. Two Node regressions cover hosted P2P open and hosted LAN retry; CI authoritative and pending.
- Previous 0.11.4.3 candidate: guest-requested consent-approved internet relay backup for WebRTC failure. Render/main/Pages and real two-phone acceptance remain pending.
- Baseline dev c57d0fdb23e657b3b274d67ff38d9b5ce6a20d79; main b3c8100a88e924dd4209396898116877602d284d. PR #56 open. Full #40501517174 and Modular #40501517177 were queued at inspection; not green certification.

## Next smallest action
1. Inspect exact-head focused Node and Modular + 4 Node/4 Chromium CI; fix failures on dev.
2. Protected green dev-to-main promotion via PR #56 only at unchanged certified SHA.
3. Verify Pages hosted byte smoke and Render broker deployment at compatible commit.
4. Test real two-phone Wi-Fi/cellular host/approve/play, fallback and LAN discovery.
5. Continue Player Studio, four-button counterable Tricks and Crown Royals directional art.

## Ownership and exclusions
Only dev/main; own checkpoint only. No force push, security bypass or false deployment claims.

## Evidence
`src/modules/lan-auto-signal.js`, `tests/lan_auto_signal_reconnect.test.cjs`, `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md`. Device and graphics QA not certified.
