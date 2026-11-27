# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.376 — KEEPER-TURN-AWARE-SHOT-LANE-READ-01.
- CPU shot-lane prediction integrates a moving keeper's live 2D steering turn through the existing Agility-limited turn model, instead of extrapolating stale cross-lane momentum. Existing GK Skill/Agility/fatigue braking, 65-unit cap and goalmouth clamp remain.
- Neutral, aligned, sub-threshold and low-speed inputs retain the prior linear prediction. Human shot aim, save reach, dive timing, ball physics, controls, saves, rosters, persistence and offline play remain unchanged.
- Production: `src/modules/ai.js`; focused Node and actual-GameEngine desktop/simulated-touch Chromium regressions extend `ai_keeper_shot_read` and `keeper_shot_calibration_browser_qa.py`.

## Next smallest action
- .376 exact-head Modular QA #46048998500 and Full Regression Census #46048998495 each found one fixture-only failure: 400-unit/s turning did not overcome the existing brake allowance and did not change the discrete shot lane. The fixture now uses 800-unit/s cross-lane momentum; production logic and thresholds are unchanged.
- Rerun Modular QA and the four-Node/four-Chromium Census at the corrected exact head. Fix any confirmed failure without weakening production assertions.
- If all gates pass, let the existing QA-gated main pipeline promote, then independently verify main Census, Pages deployment and hosted-byte smoke.

## Ownership and exclusions
Read/update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Feature commit: `2b4c8515641476e57d9971f0f48afd9b0cbbad56`.
- First .376 exact-head Modular QA/Census: #46048998500 / #46048998495; 3,028/3,029 Node tests passed, with one CPU shot-lane fixture expectation failure.
- Previous exact dev/main head: `31f54fc5530ccd82c88590c607a603ce07f49a8a` (0.12.81.375); Census, Modular QA, Pages deployment and hosted smoke passed.
- GitHub REST reports `main.protected=false` and `dev.protected=false`.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
