# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.324 — AI-CUTBACK-SUPPORT-ARRIVAL-ASSIGNMENT-01:** during wide opponent byline possession, driveAI now computes the existing central cutback pocket before selecting defensive roles and supplies it to defensivePressers. The primary remains on the carrier; the second CPU defender is chosen for the actual receiver lane rather than merely proximity to the ball. No auto-tackle or possession change.
- Added mirrored Node helper/actual-engine cases in tests/ai_cutback_pass.test.cjs and desktop/simulated-touch Chromium acceptance in tests/ai_defensive_press_arrival_browser_qa.py. Both sides verify support pocket, primary press, possession, four actions and team catalog.
- Parent dev SHA: 8ceb0dd00a137f4aed3d2d6e24b8d9e61bbfd5e2. Parent Modular QA #45775910639 passed; parent Full Regression Census #45775910637 completed preflight/preview and all four Chromium shards, with Node shard 1 still running at last observation. The first .324 gates exposed a test-fixture cooldown issue and this checkpoint's missing registry backticks; both are being corrected without changing production behavior. This candidate's exact-head QA/Census are triggered by its commit and remain pending until observed.

## Next smallest action
Inspect exact-head Modular QA and all four Node/four Chromium Full Regression Census jobs. Fix confirmed feature or gate failures on the existing dev branch, then allow only a green exact head through the QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection open. No authenticated online-hosting claim.

## Evidence
- Parent .323 Modular QA #45775910639: passed on 8ceb0dd00a137f4aed3d2d6e24b8d9e61bbfd5e2.
- Parent .323 Full Regression Census #45775910637: queued at latest observation; no pass claimed.
- Main SHA: e1720386be42b69c068afa0c193148f21abaefe7; Pages deployment #45740394957 and independent main Census #45740402228 passed for .314.
- Branch-protection API returned 403; #87 remains unresolved. #48 remains open; no physical two-phone certification.

## Cleanup
Read only this agent's checkpoint. No LAN/P2P, roster, art, save-schema or online-hosting changes in this increment.
