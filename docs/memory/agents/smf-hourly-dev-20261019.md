# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.384 — AI-MAGIC-HAZARD-FORWARD-SIDESTEP-01.
- CPU outfielders now sidestep a Banana Peel/Ice Patch that blocks their current lane while retaining a small forward component. The chosen flank favors active-opponent clearance and pitch margin; existing slide disarm/JUMP priorities and off-lane direct-away behavior remain.
- Production: src/modules/engine.js. Focused Node: tests/magic_hazard_ai_avoidance.test.cjs. Actual-engine desktop/simulated-touch QA: tests/magic_hazard_ai_avoidance_browser_qa.py.

## Previous candidate .383
- .383 adds pressure-scaled receive bracing to the standard procedural Character Art fallback across eight existing-player headings.
- Modular QA #46076118363 passed. Census #46076118421 passed preflight, preview, Node shards 0/2/3 and browser shards 0/1/2; browser shard 3 failed only the historical lan_auto_two_browser_qa.py 10-second wait. Node shard 1 was still running at last inspection. Do not claim .383 certification or deployment.

## Next smallest action
- Inspect .384 exact-head Modular QA and Full Regression Census; repair confirmed failures without weakening gameplay or visual assertions.
- Only a fully green exact dev head may pass the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.
- Continue through-ball interception quality, counterable Magic Tricks and goalkeeper response; do not repeat already-covered Breath or LAN work.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Parent dev SHA: c5004af762393bee7a80d2f73ad74dda2480508d; main SHA: ffc4ca5122abfd16849b69c705fa5f341cb52e7a.
- .383 Modular QA #46076118363 passed; Full Regression Census #46076118421 is not green because browser shard 3 had a LAN automation timeout.
- .382 Modular QA #46073129924 and Census #46073129861 passed; main .382 Census #46074238725 and Pages deployment #46074231407 succeeded.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
