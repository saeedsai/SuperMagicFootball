# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.382 — AI-DEFENDER-TURN-AWARE-EARLY-POKE-01.
- CPU early PASS-poke commitment now projects both defender and carrier through the existing 55 ms Agility-limited turn response when a validated exposed low ball is supplied. A high-Agility defender cutting into the carrier can open the existing short poke window despite cross-track momentum; average/low, neutral/away, slow, invalid and no-ball cases retain the conservative decision.
- The .381 actual-engine fixture now leaves the high-vs-low distinction to the focused helper regression: the discrete pass-arrival sample can give both profiles the same reachable target. Actual driveAI still verifies its target wiring and high-Agility early reach.
- Production: src/modules/engine.js; focused Node/browser coverage: ai_defensive_poke_commit and ai_pass_receiver_cover.

## Next smallest action
- Inspect .382 exact-head Modular QA and Full Regression Census; repair confirmed failures without weakening gameplay assertions.
- Only a fully green exact dev head may pass the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.
- Continue through-ball interception quality, counterable Magic Tricks and goalkeeper response; do not repeat already-covered Breath or LAN work.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Parent dev SHA: e4c409f1a15f313a4ccc2cba4f946550e788976e; main SHA: f146b3c4b19795bc68f3fb57673f6b2142632d2c.
- .382 Modular QA #46072576575 and Census preflight #46072576553 found three Node failures: an over-strong .381 actual-engine target-difference assertion, truncated MASTER_BACKLOG caused by a contents-fetch wrapper limit, and missing literal backticks around this agent ID. The full backlog and exact identity are restored in the corrective commit.
- Earlier .381 runs #46070141281/#46070141272 exposed the first fixture geometry/reaction setup and were also not certified.
- .379 main Census #46063913140 and Pages deployment #46063906488 succeeded; hosted-byte smoke passed.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
