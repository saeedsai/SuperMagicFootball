# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Continue bounded tested features on existing dev; only protected green promotion to main. Preserve 223 teams/2676 players, six formations, four controls, Career/Cup ten slots, SD09, offline and saves.

## Current checkpoint
- 0.11.3.13 candidate: ignore duplicate guest join-accept after approval, preserving 25-second offer and SDP deadlines; two focused regressions.
- Baseline dev/main e8adca57e9e08b93337a4405f49525ebb555c540: dev Modular #40465003574, Full 4+4 #40465003455, Concept Hero #40465003402, Hair #40465003377; main Full hosted smoke #40466167217 and Pages #40466167228 all green.
- Issue #48 remains open; physical two-phone LAN and internet P2P/TURN uncertified. Only dev/main.

## Next smallest action
1. Inspect exact-head Modular and 4 Node + 4 Chromium; repair failures on dev.
2. Promote only unchanged completely green dev through protected workflow.
3. Verify main Pages deployment and hosted HTML/JS/CSS bytes.
4. Validate physical two-client LAN and cross-network P2P/TURN.
5. Continue Player Studio, counterable Tricks and Crown Royals directional graphics.

## Ownership and exclusions
Only dev/main; do not read or edit other agents' memory.

## Evidence
`src/modules/lan-auto-lobby.js`, `tests/lan_auto_lobby_flow.test.cjs`; baseline runs above. New candidate exact-head CI pending.

## Cleanup
Checkpoint below 4 KiB; no roster, control, offline or save schema changes.
