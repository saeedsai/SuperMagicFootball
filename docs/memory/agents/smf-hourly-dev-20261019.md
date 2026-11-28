# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.405 adds AI-SUPPORT-COVER-LIVE-TURN-READ-01 in `src/modules/ai.js`: the second CPU defender's carrier-cover shade now projects a moving carrier through the existing bounded 120 ms Agility turn using trapezoidal displacement. High Agility follows a sharper cut; neutral/aligned/slow/invalid input retains linear projection and the existing per-axis 36-unit cap.
- Focused Node and actual-GameEngine desktop/simulated-touch Chromium coverage extends `ai_support_carrier_lateral_cover` for both defending directions, Agility ordering, fallbacks and bounds.
- Exact .404 dev Census #46136408289 passed all four Node and four Chromium shards and its QA-gated promotion job. Main .404 Census #46137386899 was still running after preflight, preview, hosted smoke and Node shards 0/2/3 passed; Node shard 1 and four browser shards were pending at last inspection.

## Next smallest action
Run exact-head Modular Game Dev QA and Full Regression Census for .405. Fix only confirmed failures without weakening turn, flank, possession or four-action assertions. Continue with the next unblocked player-facing backlog item.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Run start dev/main: `a23b5c1825b9d02b8ce0e529f70c9bde98652250`.
- Candidate .405: pending exact-head CI and release promotion; record immutable SHA in GitHub history and Actions.

## Evidence
- .404 Modular QA #46136408291 passed 3,072/3,072 Node tests.
- .404 dev Census #46136408289 passed preflight, preview, all four Node shards, all four Chromium shards and QA-gated promotion.
- Pages deployment #46137380849 succeeded; hosted smoke in main Census #46137386899 passed. Main Census was not yet complete at last inspection.
- GitHub reports dev.protected=false and main.protected=false; #87 remains open. Local tests not run in connected-source runtime.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
