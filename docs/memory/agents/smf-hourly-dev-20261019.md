# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.415: AI-LOFTED-PASS-JUMP-TURN-ARRIVAL-01. The second defender's lofted-pass JUMP decision now projects its current movement through the bounded Agility turn before testing the ball crossing. High-Agility defenders turning back into the flight lane can commit the existing JUMP; low-Agility defenders still carrying away are not sent into an unreachable jump. Neutral/invalid/slow/legacy movement retains the exact linear fallback.
- Gameplay source: src/modules/ai.js, defensiveLoftedPassJumpWindow. Focused Node and actual-GameEngine desktop/simulated-touch Chromium regressions extend the existing lofted-pass suites.
- Candidate .414 is promoted to main by the existing QA-gated workflow; main and dev were identical at run start. The independent main Census retry completed successfully after its hosted Render/Pages LAN-browser timeout on attempt 1.

## Next smallest action
Verify the corrected .415.1 exact-head Modular QA and Full Regression Census, especially mirrored high/low-Agility defender turns, actual JUMP action and primary pressure. Fix only confirmed failures without weakening assertions. Promote only through the existing QA-gated pipeline after a green exact head; independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Run-start dev/main: 6b488ae92b30d08de33bc5f9bc4ce10771c738d3 (identical).
- .414 Modular QA #46174916696 passed 3,088/3,088 Node tests; dev Full Regression Census #46174916728 passed preflight, preview, all four Node/four Chromium shards and QA-gated promotion.
- Main Pages deployment #46175898391 succeeded; independent main Census #46175904970 retry attempt 2 passed all jobs, including browser shard 2 and hosted-pages smoke. .415 initial Modular QA #46181275976 and Census #46181276019 both failed preflight on four release-contract assertions with two causes: README project heading remained .414 and this checkpoint's Agent ID omitted required backticks. Corrected in .415.1 without changing gameplay assertions; exact-head reruns pending.
- GitHub REST branch objects report protected=false for dev and main; #87 remains open. #86, #48, #3, #10 and #12 remain open.
- No local Node/Chromium execution or physical-device testing was performed in this run. .415 exact-head CI evidence is pending.

## Cleanup
Keep this checkpoint below 4 KiB. Leave all other agent checkpoints untouched.
