# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.367 — GROUND-SPILL-SURFACE-DRAG-READ-01: CPU primary and goal-side support now project fresh low rolling tackle spills using live Grass/Wet/Sand ball drag (.986/.96/.94), rather than a single linear roll estimate.
- Production: src/modules/ai.js and src/modules/engine.js; no new state, save-schema or roster change.
- Regressions: tests/ai_loose_ball_second_ball_cover.test.cjs and desktop/simulated-touch browser QA cover both teams, all three surfaces, airborne parity, 26-unit support split and four-action/data contracts.
- .367 first Modular QA #46004667398 found 3,021/3,022 Node tests passing; the new actual-driveAI surface test placed its ball at a fixed test coordinate instead of field center, so the support defender correctly chose its ordinary formation target. The fixture now centers the ball before checking actual primary/support dispatch; production source and surface projection assertions were not changed. Exact-head reruns required.

## Next smallest action
Inspect .367 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then advance the next distinct gameplay or existing-player animation improvement.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Base dev: 87e914539b2cf3e47dc1fb8e4c813decc13ae860; main: 9fa60ffcbf285df8b8c5145074c02c23a89d17b8.
- .366 Modular QA #46002294829 succeeded. Census #46002294636: preflight/preview and all four Node shards passed; three Chromium shards passed and one was still running.
- Main .364 Census #45996166446 and Pages deployment #45996157210 succeeded; .366 was not certified, promoted or deployed.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
