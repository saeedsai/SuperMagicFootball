# SuperMagicFootball — smf-hourly-dev-20261019
Agent ID: smf-hourly-dev-20261019
Updated: 2026-11-28

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.390 adds AI-UNTARGETED-GROUND-PASS-LANE-COVER-01: for fresh low forward passes without a receiver id, the second CPU defender shades a bounded point ahead in the live ball corridor while the primary continues pressing.
- Targeted receiver passes still use their receiver-specific interception model. Lofted, shot, lateral/backward/stale and edge trajectories retain existing behavior.
- Fixed the .389 Hide Ball browser fixture's random-contact contamination; production gameplay logic was not altered by that correction.
- No roster, formation, save schema, four-action, LAN/P2P or online-hosting changes.

## Next smallest action
- Inspect exact .390 Modular QA and Full Regression Census; especially targetless-pass desktop/simulated-touch role assignment and Hide Ball neutral-momentum resolver.
- Fix any confirmed failure without weakening gameplay assertions. Only a green exact dev head may enter the existing QA-gated main pipeline.
- Continue intelligent pass interception/attacking runs, remaining trick counterplay, goalkeeper decisions, existing-player Studio animation, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- .390 parent: b52e3aa7d731f353cbffabc29f439973c1dbd8df.
- Main: ffc4ca5122abfd16849b69c705fa5f341cb52e7a.
- Main and dev remain unprotected according to branch metadata; #87 remains open.

## Evidence
- .389 Modular QA #46086880956 passed 3,053/3,053 Node tests.
- .389 Full Regression Census #46086880968: preflight, preview, all four Node shards and browser shards 0, 1, 3 passed; browser shard 2 failed only the Hide Ball momentum browser fixture because random body contact could stun the carrier before the trick resolver.
- .390 targeted Node/Chromium and exact-head Modular QA/Census are pending at commit time; report only observed results.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
