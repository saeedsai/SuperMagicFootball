# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.394 adds MAGIC-TELEPORT-2D-ZERO-AXIS-HEADING-01: Teleport now preserves the complete dx/dy vector when one axis is zero. CPU wind-up lane selection, live slide/jump counter corridors and the 85-unit destination use the same zero-axis-safe direction; only fully neutral input falls back to facing.
- Candidate .393 fixed AI-UNTARGETED-GROUND-PASS-REACH-DISTANCE-FIX-01: defender reach is measured from the second defender to the candidate interception point, not from the ball to that point. The earliest reachable target and distant-defender fallback are preserved.
- Feature commits: .393 `203a12967bd79e837a893c664317e0166c4fac16`; .394 `e21d17909f08a2454909b0e6872f570fd0236c95`. QA-script repair: `c0324f3391f2a914650795a9203d75aa9c56c734`.
- .394 adds mirrored Node and actual-GameEngine desktop/simulated-touch Chromium coverage for both teams and both vertical directions, checking slide counter acceptance and unopposed 85-unit vertical travel. Exactly four actions remain.

## Next smallest action
- Complete Modular QA and Full Regression Census on the exact final dev head, including all four Node and all four Chromium shards. Inspect the new Teleport vertical cases and targetless-pass reach fallback.
- Fix confirmed failures without weakening assertions; only a green exact dev head may enter the existing QA-gated main pipeline.
- Continue intelligent pass interception/attacking runs, remaining trick counterplay, goalkeeper decisions, existing-player Studio animation, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Pre-checkpoint dev: `c0324f3391f2a914650795a9203d75aa9c56c734`.
- Main: `ffc4ca5122abfd16849b69c705fa5f341cb52e7a`.
- Final dev head is this checkpoint commit; verify the branch API before reporting.

## Evidence
- .392 Modular QA #46098285577: 3,056/3,057 passed; the targetless-pass reach assertion exposed the production distance mismatch.
- .393 Modular QA #46099200636: 3,057/3,057 passed.
- .393 Census #46099200642: preflight/preview and all four Node shards passed; three Chromium shards passed. Browser shard 1 failed because `ai_pass_receiver_cover_browser_qa.py` used `math.hypot` without importing `math`.
- .394 Modular QA #46100125133: 3,058/3,058 passed.
- .394 Census #46100125103: preflight/preview passed; Node shards 2 and 3 passed; remaining Node and Chromium shards were still running at last observation.
- QA-script repair commit `c0324f3391f2a914650795a9203d75aa9c56c734` adds the missing `import math`. Its exact-head Modular QA #46100236275 and Census #46100236278 were running; Census preflight passed. No final Census certification or promotion is claimed.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
