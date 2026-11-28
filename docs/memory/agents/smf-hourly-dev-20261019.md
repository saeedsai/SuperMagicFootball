# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate **0.12.81.398** adds `AI-TARGETED-GROUND-PASS-PREDICTED-EDGE-REJECTION-01`: the second CPU defender now rejects a targeted low-pass screen if the projected ball position at receiver arrival has crossed a playable margin, even when the pass starts in bounds. Exact-boundary arrivals remain eligible; primary pressure and ordinary support shape remain.
- Candidate .397 adds `MAGIC-TRICK-SECOND-SCREEN-RESIDUAL-CARRY-READ-01`: second-defender trick screens use live input, then residual 2D carrier movement, then facing only when stationary.
- .398 feature scope: `src/modules/ai.js`, mirrored Node and actual-GameEngine desktop/simulated-touch Chromium regressions. No new action, ball physics, save field, roster or persistence change.
- Feature commit: this candidate commit on the existing dev branch; exact SHA is recorded in the run report.
- Parent dev head: `597795177f56363fdb5b2aa266884150b15c8fd2`; main head: `91d5b516c47cd93307f2b18c2c1a26b75fbd591d`.

## Next smallest action
- Inspect exact-head .398 Modular QA and Full Regression Census. Fix confirmed failures without weakening gameplay assertions.
- Continue through-ball interception/counterplay, then remaining Magic Tricks, goalkeeper decisions, existing-player Studio graphics, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Main at start: `91d5b516c47cd93307f2b18c2c1a26b75fbd591d`.
- Dev parent at start: `597795177f56363fdb5b2aa266884150b15c8fd2`.
- Final dev head: this candidate commit; verify the exact branch SHA after update.

## Evidence
- .396 was promoted to main as `91d5b516c47cd93307f2b18c2c1a26b75fbd591d`; Pages deployment #46108533164 succeeded. Main Census #46108538549 had hosted smoke/preflight/preview and Node shards 2/3 passed, with remaining shards still running.
- .397 first exact-head run failed four README-heading assertions; both new gameplay Node tests passed. README heading repaired in `597795177f56363fdb5b2aa266884150b15c8fd2`; Modular QA #46108871231 passed, Census #46108871202 was running at .398 start.
- Local git clone was unavailable because this runtime could not resolve github.com; use connected GitHub source and exact-head Actions diagnostics, and report local tests as not run.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
