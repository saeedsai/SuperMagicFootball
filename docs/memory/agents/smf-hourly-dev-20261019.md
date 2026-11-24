# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.277 — AI-CARRY-ESCAPE-PARALLEL-SLIDE-READ-01:** a CPU carrier may keep a straight carry when its projected early escape point clears an active slide sweep by at least 32 units. Nearby parallel misses no longer force an unnecessary cut; crossing/close sweeps retain the existing diagonal escape.
- Production change in `src/modules/ai.js`; mirrored helper/actual-GameEngine Node and desktop/simulated-touch Chromium regressions cover both teams, parallel miss and crossing slides.
- First .277 Modular QA #45498163673 exposed two failures in existing slide-crossing regressions: the initial spatial segment-to-segment check treated the shared carrier start point as a collision for every route. The implementation now uses the existing projected-point-to-slide-segment gap, with 32-unit clearance for a straight route and the existing 18-unit diagonal threshold. Exact-head reruns are pending.
- .276 Modular QA #45488337024 passed; dev Full Regression Census #45488336910 passed preflight, preview, all four Node shards and all four Chromium shards. Its QA-gated promotion advanced main to .276. Pages deployment #45490435538 succeeded.
- Independent main Census #45490450399 attempt 1 failed two browser scripts in shard 1 (`ai_defensive_third_man_runner_cover_browser_qa.py` and `online_account_ui_browser_qa.py`; the latter timed out waiting for external service status). Failed-job-only attempt 2 is still running.

## Next smallest action
Verify the corrected .277 exact-head Modular QA and four-Node/four-Chromium Census. Investigate any reproduced failure; check the .276 main-Census retry and hosted Pages bytes independently.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; no device or hosting acceptance claimed.

## Evidence
- Before .277, dev and main both pointed to `fbee1f3cd7cf828794cad5f4b8a8dac1b14dbae9`; first .277 commit `daf2073235bb5ab301ac862eb02714c3ed7aa484` is superseded by the correction commit.
- .276 exact-head dev Census #45488336910 passed all four Node and four Chromium shards; Modular QA #45488337024 passed 2,871/2,871; promotion succeeded; Pages #45490435538 passed.
- #87: branch metadata reports `main.protected=false` and `dev.protected=false`; repository rulesets are empty. The protection endpoint is inaccessible to the connected integration. #86, #48, #3 and #12 remain open.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
