# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.392 adds AI-UNTARGETED-GROUND-PASS-REACH-READ-01: the second CPU defender now chooses the earliest sampled low-pass corridor point reachable using its actual reaction delay, speed, Defence and Agility-limited turn.
- The base corridor hint remains the role-selection/fallback target; targeted receiver interception and lofted JUMP cover are unchanged. Passes already outside the playable margin are rejected.
- Focused mirrored Node and actual-GameEngine desktop/simulated-touch Chromium regressions cover both teams, reach fallback, primary pressure, possession, 223 teams and exactly four actions.
- Feature/release commit: 19250ba0dda85c7fe5b399ce6dc30e64e3580c71. Regression fixture correction: 386a155ba39f194e1df5585b8727d2f1a7c746d3. Final checkpoint commit follows it.

## Next smallest action
- Inspect exact .392 Modular QA and Full Regression Census at the final dev head. Verify the reachable early point, unreachable fallback, out-of-bounds rejection, both directions, targeted pass reach and lofted JUMP.
- Fix confirmed failures without weakening gameplay assertions. Only a green exact dev head may enter the existing QA-gated main pipeline.
- Continue intelligent pass interception/attacking runs, remaining trick counterplay, goalkeeper decisions, existing-player Studio animation, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Pre-update dev: 9a234d9d7e13981bdfa25dfca73c753b29a72600.
- Main: ffc4ca5122abfd16849b69c705fa5f341cb52e7a.
- Final dev head is the checkpoint commit immediately following the feature/release commit; verify the branch API after integration.

## Evidence
- .391 Modular QA #46095505771: 3,054 passed, 2 failed (targetless-pass out-of-bounds edge and this checkpoint's identity formatting).
- .391 Full Regression Census #46095505767: preflight failed on the same two Node contracts; downstream shards were skipped.
- .392 first Node run #46098070689: 3,037 passed; targetless-pass test file failed to parse at line 427 due to a stale insertion offset. Corrected in 386a155ba39f194e1df5585b8727d2f1a7c746d3.
- .392 Full Regression Census #46098070639: preflight failed on that same syntax error; browser shards were skipped. Fresh exact-head Node/Chromium QA is pending; do not claim passing results until observed.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
