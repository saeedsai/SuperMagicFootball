# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Continue bounded tested changes directly on existing dev; green exact-head protected promotion only. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- 0.11.3.14 candidate: rejected guest admission retires pending SDP peer, cancels negotiation timer and clears room identity; two focused regressions.
- Baseline dev/main `58cf9298bd59e3b02e6d5adab09c4ed17585e619`, 0.11.3.13. Issue #48 remains open. Real two-phone LAN and internet P2P/TURN not certified.

## Next smallest action
1. Inspect candidate exact-head Modular QA and 4 Node + 4 Chromium; repair failures on dev.
2. Promote only unchanged completely green dev through protected workflow.
3. Verify main Pages hosted HTML/JS/CSS byte hashes.
4. Validate physical two-client LAN and cross-network P2P/TURN.
5. Continue Player Studio, counterable Tricks and Crown Royals graphics.

## Ownership and exclusions
Only dev/main; never read/edit other agents' memory.

## Evidence
`src/modules/lan-auto-lobby.js`, `tests/lan_auto_lobby_flow.test.cjs`; exact-head CI pending.

## Cleanup
Checkpoint under 4 KiB; no roster, control, offline or save schema changes.
