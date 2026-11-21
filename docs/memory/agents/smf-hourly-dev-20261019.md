# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .153 AI-TACKLE-RUNUP-READ-01: CPU defenders reserve the existing SHOOT slide for a running approach against an escaping or laterally crossing carrier; otherwise they use the shorter PASS poke.
- Focused tests cover mirrored pursuit, lateral crossing, standing/close/ineligible fallbacks and source wiring for both driveAI tackle paths. The source contract now reads the engine via a CommonJS-compatible root-relative path.

## Next smallest action
Run .153 focused Node regression, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards). Fix confirmed failures, then continue with a distinct unblocked product increment.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Parent dev/main before .153: e58a8d999e1ffbdc082f10bfc29bd3701b4822fa. .152 Modular QA #44894786558, dev Census #44894786561 (all eight shards; promotion succeeded), Pages deployment #44895492408 and main Census/hosted smoke #44895492736 passed. .153 preflight #44897612432, #44897810682, #44897949299 and #44898168467; Modular QA #44897612479, #44897810756, #44897949365 and #44898066093 each failed only in the evolving focused test fixture. The direct movement-helper cases passed. Main protection #87 remains unresolved; #48 and Render drift #86 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.