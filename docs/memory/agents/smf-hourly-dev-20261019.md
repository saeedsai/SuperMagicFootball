# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26 17:05 CET

## Mission
One bounded tested increment each hourly run on existing dev. Protected green exact-head main promotion only. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- Baseline dev 2f0e52c3b5321f53352cf6ee9b7b541274418152 (0.10.7.13), main f69e79b230af2e4a35b535a40887b76d1f23a248 (0.10.7.12).
- LAN-071 candidate 0.10.7.14: guest subscribes to RTC readiness, immediately resets tick/input/snapshot freshness when connection drops between game steps, and unsubscribes on dispose. Focused V8 red-before/green-after passed; Node regression added. Exact-head 4 Node/4 Chromium and Modular QA pending.
- LAN-070 guest snapshot recovery requires a fresh host transport; actual protocol reconnect, broker discovery and two-phone acceptance remain unverified. Never equate a candidate with a certified Pages release.

## Next smallest action
1. Inspect exact-head Modular and full 4 Node + 4 Chromium CI; repair any red shard.
2. Promote only exact green dev head via protected workflow; verify main/Pages hosted bytes.
3. Verify LAN Host/Find, consent, reconnect and gameplay on two phones.
4. Implement next counterable four-button Player Studio Trick increment.
5. Improve Crown Royals front/quarter/side/back graphics and animations.

## Ownership and exclusions
Only own checkpoint writable; never create branches, force push, bypass security or edit other agents' memory. Keep under 4 KiB; Git history is audit.
