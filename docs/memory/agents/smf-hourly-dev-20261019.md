# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.383 — CHARACTER-ART-RECEIVE-BRACE-PARITY-01.
- Standard procedural Character Art now consumes the shared pressure-scaled ARTPOSE receive sample: both knees flex, the base widens and arms open for balance during the existing receive action. Premium path, root crouch/lean and receive gaze remain unchanged.
- Production: src/modules/render.js and src/modules/characterart.js. Focused Node: tests/characterart_receive_gaze.test.cjs. Actual-renderer desktop/simulated-touch eight-heading QA: tests/characterart_receive_gaze_browser_qa.py.

## Previous candidate .382
- .382 introduced AI-DEFENDER-TURN-AWARE-EARLY-POKE-01 in src/modules/engine.js.
- Modular QA #46073129924 passed 3,041/3,041 Node tests at the .382 candidate.
- Full Regression Census #46073129861 had preflight, preview, Node shards 2/3 passed; remaining Node and Chromium shards were running at the last observed checkpoint. Do not claim .382 certification or deployment without final job results.

## Next smallest action
- Inspect .383 exact-head Modular QA and Full Regression Census; repair confirmed failures without weakening gameplay or visual assertions.
- Only a fully green exact dev head may pass the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.
- Continue through-ball interception quality, counterable Magic Tricks and goalkeeper response; do not repeat already-covered Breath or LAN work.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Parent dev SHA: ffc4ca5122abfd16849b69c705fa5f341cb52e7a; main SHA: f146b3c4b19795bc68f3fb57673f6b2142632d2c.
- .382 Modular QA #46073129924 and Census #46073129861 are tracked above; only observed shard results are recorded.
- .379 main Census #46063913140 and Pages deployment #46063906488 succeeded; hosted-byte smoke passed.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
