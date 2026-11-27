# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.381 — AI-DEFENSIVE-PASS-STEERING-RECOVERY-READ-01.
- CPU second-defender reach estimates now integrate the first at most 0.12 seconds of live Agility-limited steering before judging a targeted low-pass interception. A defender already turning into the lane can claim an earlier point; low-Agility, retreating, neutral, aligned and invalid steering retain the previous conservative reach.
- The .380 exact-head Census exposed one browser-fixture assertion that compared longitudinal progress for a lateral receiver turn. Actual output showed the expected high/low lane offset; the fixture now asserts that offset rather than requiring a false x-progress difference.
- Production: `src/modules/ai.js`; focused helper and actual-GameEngine Node regressions: `ai_pass_receiver_cover`.

## Next smallest action
- Inspect exact-head Modular QA and Full Regression Census for .381; fix only confirmed failures without weakening gameplay assertions.
- If the exact dev head is green, allow the existing QA-gated promotion pipeline to advance main; independently verify main Census, Pages deployment and hosted bytes.
- Continue with through-ball interception quality, counterable Magic Tricks and goalkeeper response; do not repeat already-covered Breath or LAN work.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Parent dev SHA before .381: `990cdea6eaf0d0417564f5d89f58d358781dbcc3`; main SHA: `f146b3c4b19795bc68f3fb57673f6b2142632d2c`.
- .380 Modular QA #46065396845 passed 3,037/3,037 Node tests.
- .380 Full Regression Census #46065396789 failed only browser shard 1 in `ai_pass_receiver_cover_browser_qa.py`: high/low receiver turns shifted the projected lane y as expected, but the fixture also required a 15-unit longitudinal x difference for a straight pass. Node shards 0–3 and browser shards 0, 2 and 3 passed.
- .379 Pages deployment #46063906488 and main Census #46063913140 succeeded; hosted-byte smoke passed.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
