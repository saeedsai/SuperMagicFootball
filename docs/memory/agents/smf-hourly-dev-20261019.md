# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.277 — AI-CARRY-ESCAPE-SWEPT-LANE-READ-01:** CPU carriers now compare the full early escape segment with each active slide's projected sweep. A nearby parallel slide that misses the straight lane no longer forces an unnecessary lateral cut; true crossing slides still favor a safe diagonal.
- Production change in `src/modules/ai.js`; focused Node helper/actual-GameEngine tests and desktop/simulated-touch Chromium acceptance cover both teams, the parallel miss and existing true-crossing behavior.
- .276 Modular QA #45488337024 passed; dev Full Regression Census #45488336910 passed preflight, preview, all four Node shards and all four Chromium shards. Its existing QA-gated promotion advanced main to .276.
- Pages deployment #45490435538 succeeded. Independent main Census #45490450399 failed browser shard 1 in two scripts: `ai_defensive_third_man_runner_cover_browser_qa.py` and `online_account_ui_browser_qa.py`; the latter timed out waiting for the external online service to show its expected loading/server status. Failed-job-only retry was requested; its result must be checked separately.
- .277 exact-head Modular QA and Full Regression Census are pending.

## Next smallest action
Complete .277 exact-head Modular QA and four-Node/four-Chromium Census; repair any confirmed failures. Check the .276 main-Census failed-job-only retry and independently verify Pages hosted bytes after the next promotion.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; no device or hosting acceptance claimed.

## Evidence
- Before .277, dev and main both pointed to `fbee1f3cd7cf828794cad5f4b8a8dac1b14dbae9`.
- .276 exact-head dev Census #45488336910 passed all four Node and four Chromium shards; Modular QA #45488337024 passed 2,871/2,871; promotion job succeeded. Pages deployment #45490435538 passed.
- Main Census #45490450399 failed two browser scripts in shard 1; failed-job-only retry was requested. No LAN/P2P source changed.
- Branch metadata reports `main.protected=false` and `dev.protected=false`; repository rulesets are empty. The dedicated main-protection endpoint is not accessible to the connected integration. Issue #87 remains open.
- #86 Render drift, #48 physical two-phone acceptance, #3 Android Rainbow Dribble and #12 deployed About revision remain open.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
