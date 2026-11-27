# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.384 — AI-MAGIC-HAZARD-FORWARD-SIDESTEP-01.
- CPU outfielders sidestep a Banana Peel/Ice Patch blocking their lane while retaining a small forward component. The selected flank favors active-opponent clearance and pitch margin; existing slide disarm/JUMP priorities and off-lane direct-away behavior remain.
- Production: src/modules/engine.js. Focused Node: tests/magic_hazard_ai_avoidance.test.cjs. Actual-engine desktop/simulated-touch QA: tests/magic_hazard_ai_avoidance_browser_qa.py.

## Exact-head QA diagnosis
- Feature commit: 9fbfbb65b825773a262d8e54deba4b61a1044a83.
- Initial Modular QA #46077597577 and Census #46077597565 ran 3,044 Node tests: 3,041 passed, 3 failed only because sw.js still labelled its modular offline-shell header .383 while package/release/README/cache were .384.
- Corrective commit updates only the sw.js header comment to .384. No gameplay implementation or regression assertions changed. Exact-head reruns remain required.

## Previous candidate .383
- .383 added pressure-scaled receive bracing to the standard procedural Character Art fallback across eight existing-player headings.
- Modular QA #46076118363 passed. Census #46076118421 failed only browser shard 3's historical lan_auto_two_browser_qa.py 10-second wait; all four Node shards and three other browser shards passed. Do not claim .383 certification or deployment.

## Next smallest action
- Inspect corrective-head .384 Modular QA and Full Regression Census; repair any confirmed failure without weakening gameplay or visual assertions.
- Only a fully green exact dev head may pass the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.
- Continue through-ball interception quality, counterable Magic Tricks and goalkeeper response; do not repeat already-covered Breath or LAN work.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Parent feature SHA: 9fbfbb65b825773a262d8e54deba4b61a1044a83; main SHA: ffc4ca5122abfd16849b69c705fa5f341cb52e7a.
- Main .382 Census #46074238725 passed all eight shards; Pages deployment #46074231407 succeeded; hosted smoke reported exact main HTML/JS/CSS bytes.
- .383 Modular QA #46076118363 passed; its Full Regression Census had one historical LAN browser timeout.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
