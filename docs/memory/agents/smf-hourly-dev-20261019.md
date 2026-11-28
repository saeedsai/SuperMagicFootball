# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
Updated: 2026-11-28

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.390 introduced AI-UNTARGETED-GROUND-PASS-LANE-COVER-01, a bounded second-defender hint for fresh low forward passes without a receiver id.
- Confirmed .390 integration gap: the hint selected the support defender but was not used as that defender's final movement target; targeted and lofted cover paths were unaffected.
- Candidate 0.12.81.391 routes the validated targetless-pass hint into the second defender's actual aiTarget, preserving targeted receiver reach and lofted JUMP behavior.
- Focused actual-GameEngine Node and desktop/simulated-touch Chromium regressions now assert the second defender reaches the corridor while the primary keeps pressing.
- Gameplay commit: 41bd92abf44d80728669217b23e6f68357f8bc89; Node regression commit: 072650546b157f5ed36d1558c83de44c26836128; browser regression commit: 3ebf651bc4850b6695a583c5c3282086ee0ca499; Node fixture-height correction: 484c29fd309c4c8606f9f78f2c2fe761ae055673; browser fixture-height correction: 5720883ec187932dfd07187943276ce9d6708fab.
- No roster, formation, save schema, four-action, LAN/P2P or online-hosting changes.

## Next smallest action
- Inspect exact .391 Modular QA and Full Regression Census; especially both defending directions, targetless corridor movement, targeted receiver reach, lofted JUMP, and primary pursuit in desktop/simulated-touch.
- Fix any confirmed failure without weakening gameplay assertions. Only a green exact dev head may enter the existing QA-gated main pipeline.
- Continue intelligent pass interception/attacking runs, remaining trick counterplay, goalkeeper decisions, existing-player Studio animation, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- .390 parent recorded in prior checkpoint: b52e3aa7d731f353cbffabc29f439973c1dbd8df.
- Main: ffc4ca5122abfd16849b69c705fa5f341cb52e7a.
- Final .391 dev head is the SHA of this checkpoint commit; branch metadata/API status must be rechecked after CI.

## Evidence
- .389 Modular QA #46086880956 passed 3,053/3,053 Node tests.
- .389 Full Regression Census #46086880968: browser shard 2 failed the Hide Ball momentum fixture due to random body-contact contamination; .390 corrected the fixture without production changes.
- .391 targetless-pass fixtures use z=9 so the low ball remains above the ground over the helper's 0.10–0.22 s projection; both Node and browser fixtures were corrected before certification. Exact-head Modular QA and Full Regression Census results remain pending; do not claim them passing until observed.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
