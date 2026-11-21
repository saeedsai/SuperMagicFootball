# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .153 AI-TACKLE-RUNUP-READ-01: CPU defenders use the existing SHOOT slide only when they have a run-up and the carrier is escaping ahead or cutting laterally across the approach lane; a carrier moving into the defender is met with the shorter PASS poke.
- Existing difficulty-scaled tackle-attempt and slide-roll probabilities, slide reach, cooldowns and four actions are unchanged. Focused tests cover mirrored pursuit, lateral crossing, approach/standing/invalid fallbacks and live driveAI behavior.

## Next smallest action
Run .153 focused Node tests, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards). Fix confirmed failures, then move to the next distinct backlog item; do not repeat cutback work. Existing-player art requires actual Studio import/export and game-scale screenshot QA.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Parent dev/main: e58a8d999e1ffbdc082f10bfc29bd3701b4822fa. .152 Modular QA #44894786558, dev Census #44894786561 (all eight shards; promotion succeeded), Pages deployment #44895492408 and main Census/hosted smoke #44895492736 passed. Main protection #87 remains unresolved; #48 and Render drift #86 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.