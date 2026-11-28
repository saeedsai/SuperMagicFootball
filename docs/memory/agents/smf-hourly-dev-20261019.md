# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.404 adds AI-DEFENDER-LIVE-TURN-ARRIVAL-PRESS-01 in `src/modules/ai.js`: for a moving opponent carrier, CPU primary-presser arrival now includes each defender's live 120 ms Agility-limited steering turn. A defender turning toward the carrier can beat an equally close defender whose momentum turns away; slow/neutral/malformed fallback and stationary/loose-ball ordering remain unchanged.
- Focused coverage: `tests/ai_defensive_press_arrival.test.cjs` and actual-GameEngine desktop/simulated-touch `tests/ai_defensive_press_arrival_browser_qa.py`, mirrored for both defending teams.
- .403 exact-head Modular QA #46134759990 passed. Census #46134759956 preflight/preview and Node shards 0, 2, 3 passed; Node shard 1 and all four Chromium shards were running at last inspection.
- .404 commit and exact-head CI results are recorded in the current GitHub run/report.

## Next smallest action
Inspect .404 Modular QA and exact-head Full Regression Census. Fix only confirmed failures without weakening turn, possession or four-action assertions. Continue with the next unblocked player-facing backlog item even if an external release gate remains pending.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Run start dev: 543f86b02d8d79f74e5f230968c918730a85d3e9.
- Run start main: d607bb8747f593b04801b79314388218d6ff0375.
- Candidate .404: exact current dev HEAD; immutable SHA and test evidence are in Git history and Actions.

## Evidence
- Main .402 Full Regression Census #46134410631 and Pages deployment #46134404813 passed; hosted-byte smoke not yet independently rechecked in this run.
- GitHub reports dev.protected=false and main.protected=false; #87 remains open.
- Local tests not run in the connected-source runtime. No .404 result is claimed until exact-head Actions complete.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
