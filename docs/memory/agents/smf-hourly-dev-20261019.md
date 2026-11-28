# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate **0.12.81.402** adds `KEEPER-CUTBACK-LIVE-TURN-MARKING-01`: the goalkeeper evaluates both the central cutback runner and its nearest defender through the same bounded 120 ms Agility-limited turn. A marker turning out of the lane no longer falsely suppresses the keeper shade; a lower-Agility marker retaining enough momentum still counts as cover. The runner's own turn also moves the keeper shade along its projected lateral path. Neutral/slow/aligned steering preserves the previous capped 18-unit linear lead.
- Production scope: `src/modules/engine.js`; focused Node and actual-GameEngine desktop/simulated-touch regressions in `tests/keeper_cutback_read.test.cjs` and `tests/keeper_cutback_runner_arrival_browser_qa.py`.
- Release surfaces: About-only .402, package, root README banner/heading, version policy, service-worker cache identity and master backlog updated together.

## Next smallest action
- Verify .402 Modular QA and exact-head Full Regression Census; repair any confirmed turn-projection or browser fixture failure without weakening the 64-unit marker or 18-unit lead bounds.
- Continue responsive ground/through-ball interception and counterable Magic Tricks, then Studio-backed existing-player graphics, goalkeeper dive/catch, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Run start dev/main: `5ab22f2bcc078d72bd1066d7690c1289bbda6faa`.
- Candidate .402 commit: pending; verify exact SHA from GitHub Actions.

## Evidence
- .401 exact-head Modular QA #46119674797 and Full Regression Census #46119674878 passed; all four Node and all four Chromium Census shards passed.
- QA-gated promotion advanced main to .401. Main Census #46120402664 and Pages deployment #46120396983 completed successfully; verify hosted-byte smoke before reporting final release state.
- Local tests not run in this connected-source runtime; exact-head GitHub Actions results are the release evidence.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
