# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.349 — PASS-LANE-AGILITY-STEERING-READ-01:** directed ground-pass pressure now projects moving defenders through their current steering vector using the existing Agility-limited turn response. High Agility can bend a defender into a direct lane; low Agility retains cross-track momentum. Only the predicted pressure point changes; slide sweeps, pass physics and movement remain intact.
- **Feature files:** src/modules/shotfeel.js, tests/directed_pass_lane.test.cjs, tests/ai_support_pass_arrival_browser_qa.py; release metadata and backlog updated. Candidate commit df8192ef85d061b37bdac5adf7dcac0f403fb2d4; first exact-head QA/Census exposed one fallback-test fixture mismatch (slow speed 50 compared with a 110-speed fallback). Corrected to compare same-speed linear fallback; rerun pending.
- **Base dev:** 632c8e10c0b3f6f7acac3a1d226dd3abdfdf6642. Modular QA #45928627941 passed; Census #45928627880 is running (preflight/preview and Node shards 2/3 passed; Node 0/1 and four Chromium shards running). .348 is not yet Census-certified or promoted.
- **Main:** b5e01e61d08e9b5dc63325b2525c8300743769d1; Pages #45922163185 and main Census #45922171346 passed, including hosted smoke.

## Next smallest action
Inspect the rerun after correcting the slow-defender fallback comparison in the focused test. Fix any confirmed failure without weakening assertions; then let only a fully green exact head enter the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next gameplay increment.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Base dev SHA 632c8e10c0b3f6f7acac3a1d226dd3abdfdf6642; .348 Modular QA #45928627941 passed; Census #45928627880 in progress.
- .347 main SHA b5e01e61d08e9b5dc63325b2525c8300743769d1; Pages #45922163185 and main Census #45922171346 passed.
- GitHub REST: main.protected=false, dev.protected=false, no active rulesets; #87 remains open. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, concept-art or online-hosting changes.
