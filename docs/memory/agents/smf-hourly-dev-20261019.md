# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate **0.12.81.402** adds `KEEPER-CUTBACK-LIVE-TURN-MARKING-01`: the goalkeeper evaluates both the central cutback runner and its nearest defender through the same bounded 120 ms Agility-limited turn. A marker turning out of the lane no longer falsely suppresses the keeper shade; a lower-Agility marker retaining enough momentum still counts as cover. The runner's own turn also moves the keeper shade along its projected lateral path. Neutral/slow/aligned steering preserves the previous capped 18-unit linear lead.
- Production scope: `src/modules/engine.js`; focused Node and actual-GameEngine desktop/simulated-touch regressions in `tests/keeper_cutback_read.test.cjs` and `tests/keeper_cutback_runner_arrival_browser_qa.py`.
- First exact-head Census #46131833980 exposed three .402 service-worker header contract failures and one marker fixture whose runner movement was not isolated; corrected the header and made the fixture deterministic. No production gameplay failure established from that attempt.

## Next smallest action
- Rerun .402 Modular QA and exact-head Full Regression Census; repair any confirmed turn-projection or browser fixture failure without weakening the 64-unit marker and 18-unit lead bounds.
- Continue responsive ground/through-ball interception and counterable Magic Tricks, then Studio-backed existing-player graphics, goalkeeper dive/catch, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Run start dev/main: `5ab22f2bcc078d72bd1066d7690c1289bbda6faa`.
- Feature candidate .402: `042012c80a792dc3a8983af8eed779f03eea5d2b`.
- Follow-up test/metadata repair commit: pending.

## Evidence
- .401 exact-head Modular QA #46119674797 and Full Regression Census #46119674878 passed; all four Node and all four Chromium Census shards passed.
- QA-gated promotion advanced main to .401. Main Census #46120402664 passed all eight shards; hosted-pages-smoke passed exact HTML/JS/CSS bytes after two Pages propagation retries. Pages deployment #46120396983 succeeded.
- .402 Census #46131833980 preflight: 3,064/3,068 passed, four failures described above; downstream shards correctly skipped. .402 Modular QA #46131834008 and Keeper Save Event Integrity #46131833948 were still running at last inspection.
- Local tests not run in this connected-source runtime; exact-head GitHub Actions results are the release evidence.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
