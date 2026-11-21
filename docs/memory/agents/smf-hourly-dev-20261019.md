# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .152 AI-DEFENSIVE-CUTBACK-RUNNER-SCREEN-01: the second CPU defender screens the projected central receiver lane, using a 120 ms movement lead capped at 18 units per axis and a 48–110-unit retreat behind the carrier. The original central fallback remains when no eligible receiver exists.
- Focused regressions cover both attacking directions, moving receiver projection, bounded screen position, ineligible-runner fallback and live driveAI assignment. Exact-head QA pending.
- .151 Modular QA and Keeper Save Event Integrity passed; its exact-head Full Regression Census was still running when .152 superseded it. .150 remains the latest Pages-verified main release.

## Next smallest action
Run .152 focused Node regression, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards). Fix confirmed failures, then continue with a distinct gameplay increment or Studio-backed existing-player front-run art only if import/export and game-scale screenshot QA are available.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Parent dev: 0abc75dea7ecb3dbd89803d3c9189d9cf38d6f2b; main: fcb2cf962e8acc1212ebb57ba0cbd2ff7d8cd061. .151 Modular QA #44894093811 and Keeper integrity #44894093788 passed; Full Regression Census #44894093866 was in progress at supersession. Main .150 Pages deployment #44889268418 passed.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
