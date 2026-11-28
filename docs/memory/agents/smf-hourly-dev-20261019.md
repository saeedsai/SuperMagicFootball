# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate **0.12.81.399** adds `AI-THROUGH-BALL-HURT-RECOVERY-LANE-READ-01`: a CPU through-ball no longer treats an opponent's lingering hurt animation as a collection-pocket blocker after its stun has expired. Once the hurt action timer clears, that defender blocks normally again. Active slides, receiver turning and goalkeeper collection safety are unchanged.
- Production scope: `src/modules/ai.js`; focused Node regression in `tests/ai_support_run_pass.test.cjs`; actual-GameEngine desktop/simulated-touch regression in `tests/ai_through_ball_keeper_safety_browser_qa.py`.
- Feature commit: `8c2dba3e98072dcf5a17f8b378725fb299d5ab7b`. Checkpoint commit follows it; final dev SHA is the second commit.
- Candidate .398 passed Modular QA #46109198301 and exact-head Full Regression Census #46109198318 (all four Node and all four Chromium shards); the existing QA-gated workflow promoted it to main.
- At .399 start, dev and main both pointed to `8fde36f00c69a37636a303eb69799ce6554a9186`. Main Pages deployment #46109989046 and main Census #46109994125 were still running at last inspection.

## Next smallest action
- Verify .399 Modular QA and exact-head Full Regression Census. Fix any confirmed failure without weakening the hurt/recovered boundary or existing active-slide/keeper assertions.
- Continue responsive through-ball/interception behavior, then remaining Magic Trick counterplay, goalkeeper decisions, existing-player Studio graphics, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Run start: dev/main `8fde36f00c69a37636a303eb69799ce6554a9186`.
- Final dev head: see this run's report and exact-head Actions.

## Evidence
- .398 Modular QA #46109198301 passed; Census #46109198318 passed all eight shards and auto-promotion succeeded.
- Main Pages #46109989046 and main Census #46109994125 were in progress when .399 began.
- Local git clone remains unavailable in this runtime; use connected GitHub source and exact-head Actions diagnostics, and report local tests as not run.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
