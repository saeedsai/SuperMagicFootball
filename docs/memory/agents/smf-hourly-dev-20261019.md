# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.405 adds AI-SUPPORT-COVER-LIVE-TURN-READ-01 in `src/modules/ai.js`: the second CPU defender's carrier-cover shade projects a moving carrier through the existing bounded Agility-limited 120 ms turn using trapezoidal displacement. Higher Agility follows more of a live cut; neutral/aligned/slow/invalid input retains linear projection and the existing per-axis 36-unit cap.
- Focused Node and actual-GameEngine desktop/simulated-touch Chromium coverage extends `ai_support_carrier_lateral_cover` for both defending directions, Agility ordering, fallbacks and bounds.
- First exact-head Modular QA #46138500183: 3,068/3,073 passed. One new mirrored-cap fixture expected the wrong x-coordinate for team 1; four release contracts found the README project heading still at .404. Both are corrected in the follow-up commit; no production gameplay assertion failed.

## Next smallest action
Inspect the corrected exact-head Modular QA and Full Regression Census. Fix only confirmed failures without weakening turn, flank, possession or four-action assertions. Continue with the next unblocked player-facing backlog item.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Run start dev/main: `a23b5c1825b9d02b8ce0e529f70c9bde98652250`.
- Feature commit: `d7855c507e57337a580d0186fcf9cf3211633195`.
- Corrected .405 head: pending exact-head CI and release promotion.

## Evidence
- .404 Modular QA #46136408291 passed 3,072/3,072 Node tests.
- .404 dev Census #46136408289 passed all four Node and four Chromium shards and QA-gated promotion.
- Main .404 Census #46137386899 and Pages #46137380849 completed successfully; hosted smoke passed.
- GitHub reports dev.protected=false and main.protected=false; #87 remains open. Local tests not run in connected-source runtime.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
