# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.409: MACE-SWEEP-2D-LIVE-APPROACH-READ-01. The existing Mace Sweep read now uses live two-dimensional steering/residual movement to decide whether a grounded defender faces and closes on the caster; vertical/diagonal turn-in can counter despite stale horizontal facing, while retreat does not.
- Reused the existing shared 2D facing helper; retained the Defence-versus-Dribbling threshold, closing requirement, .24-second tell, hit/push, cooldown/cost and possession behavior.
- Added mirrored Node resolver/CPU-response tests and actual-GameEngine desktop/simulated-touch browser coverage for both teams. Updated the three extracting Node harnesses to inject the shared helper dependency.

## Next smallest action
Verify exact-head .409 Modular QA and all four Node/four Chromium Full Regression Census shards. Fix only confirmed failures without weakening the read, JUMP/slide counter, possession or four-action assertions; then continue the next unblocked player-facing backlog item.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Run start dev: 0750141d44dec1f0ccacd1acb8cc5f94958cd941.
- Run start main: 6b3879a0c951da6ae86c711b323973f1e8a4c6ec.
- .408.3 Lightning harness correction: 0baaed4474599bdec79905783bf339173bdf86b5.
- .408.3 Modular QA #46154180741 passed; Full Regression Census #46154180723 passed preflight and was still running Node/Chromium shards when .409 was prepared. Earlier .408 failures were isolated to extracted-helper/fixture contracts; no production Lightning failure was observed.
- Main .406 SHA 6b3879a0c951da6ae86c711b323973f1e8a4c6ec: Census #46145612859 and Pages #46145607413 succeeded. Branch protection remains false; #87 is open.

## Cleanup
Keep this checkpoint below 4 KiB. Leave all other agent checkpoints untouched.
