# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.380 — AI-DEFENSIVE-GROUND-PASS-TURN-READ-01.
- CPU second-defender cover for targeted low passes now predicts a receiver's bounded Agility-limited turn from live movement axes and steering intent instead of assuming straight-line momentum. The projected endpoint feeds pass arrival, pocket validation and interception reach.
- Neutral/aligned/invalid/incomplete movement keeps the previous linear lead and 70-unit axis cap. Primary ball pressure, pass physics, four actions, saves, rosters and offline play are unchanged.
- Production: `src/modules/ai.js`; focused Node and actual-engine desktop/simulated-touch browser tests: `ai_pass_receiver_cover`.

## Next smallest action
- Inspect exact-head Modular QA and Full Regression Census for .380; fix only confirmed failures without weakening gameplay assertions.
- If the exact dev head is green, allow the existing QA-gated promotion pipeline to advance main; independently verify main Census, Pages deployment and hosted bytes.
- Continue with through-ball interception quality, counterable Magic Tricks and goalkeeper response; do not repeat already-covered Breath or LAN work.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Parent dev/main SHA before .380: `f146b3c4b19795bc68f3fb57673f6b2142632d2c`.
- .379 Modular QA #46062818366 passed; dev Full Regression Census #46062818433 passed all four Node/four Chromium shards and QA-gated promotion.
- .379 Pages deployment #46063906488 succeeded; independent main Census #46063913140 was still running after preflight and hosted Pages smoke passed.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
