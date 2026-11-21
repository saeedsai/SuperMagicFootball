# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .153 AI-TACKLE-RUNUP-READ-01: CPU defenders reserve the existing SHOOT slide for a running approach against an escaping or laterally crossing carrier; otherwise they use the shorter PASS poke.
- First exact-head CI exposed one fixture interaction: the live driveAI test inherited a Magic Wall, whose independent SHOOT-slide counter correctly ran before ordinary tackle selection. The test now clears that unrelated field hazard and prior events; gameplay code is unchanged in this repair.

## Next smallest action
Run the isolated .153 focused Node regression, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards). Fix confirmed failures, then continue with a distinct unblocked product increment.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Parent dev/main before .153: e58a8d999e1ffbdc082f10bfc29bd3701b4822fa. .152 Modular QA #44894786558, dev Census #44894786561 (all eight shards; promotion succeeded), Pages deployment #44895492408 and main Census/hosted smoke #44895492736 passed. .153 initial preflight #44897612432 and Modular QA #44897612479 each found one failure in the new live poke fixture; 2,608/2,609 tests passed. Main protection #87 remains unresolved; #48 and Render drift #86 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.