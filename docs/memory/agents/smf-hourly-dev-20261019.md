# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.376 — KEEPER-TURN-AWARE-SHOT-LANE-READ-01.
- CPU shot-lane prediction now integrates a moving keeper's live 2D steering turn through the existing Agility-limited turn model, instead of extrapolating stale cross-lane momentum. Existing GK Skill/Agility/fatigue braking, 65-unit cap and goalmouth clamp remain.
- Neutral, aligned, sub-threshold and low-speed inputs retain the prior linear prediction. Human shot aim, save reach, dive timing, ball physics, controls, saves, rosters, persistence and offline play remain unchanged.
- Production: `src/modules/ai.js`; focused Node and actual-GameEngine desktop/simulated-touch Chromium regressions extend `ai_keeper_shot_read` and `keeper_shot_calibration_browser_qa.py`.

## Next smallest action
- Inspect exact-head Modular QA and four-Node/four-Chromium Full Regression Census for .376. Fix only confirmed failures without weakening production assertions.
- If all exact-head gates pass, let the existing QA-gated main pipeline promote, then independently verify main Census, Pages deployment and hosted-byte smoke.
- Continue with the next uncompleted player-facing item in the master backlog; do not repeat Breath or LAN/P2P work without a reproduced regression.

## Ownership and exclusions
Read/update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Feature commit pending exact-head GitHub Actions results.
- Previous exact dev/main head before this candidate: `31f54fc5530ccd82c88590c607a603ce07f49a8a` (0.12.81.375); .375 Census, Modular QA and Pages deployment passed, with main hosted smoke successful.
- GitHub REST reported `main.protected=false` and `dev.protected=false` before this candidate.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
