# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate **0.12.81.397** adds `MAGIC-TRICK-SECOND-SCREEN-RESIDUAL-CARRY-READ-01`: a second-defender first-touch Magic Trick screen now follows the carrier's residual 2D movement after directional input releases, instead of falling back to stale facing. Live non-neutral input remains authoritative; only fully stationary carriers use the existing face fallback. Retreating momentum cannot falsely qualify for a forward screen.
- Feature scope: `src/modules/ai.js`, with mirrored helper, real-GameEngine Node and desktop/simulated-touch Chromium regressions. No new action, automatic tackle, save field, roster or physics change.
- Feature commit: `be5a16bc838d5c6f1156739366b064df6af82a80`.
- Feature commit parent: `91d5b516c47cd93307f2b18c2c1a26b75fbd591d`; main at repair: `91d5b516c47cd93307f2b18c2c1a26b75fbd591d`.

## Next smallest action
- Inspect exact-head .397 Modular QA and Full Regression Census. Fix confirmed source or test failures without weakening gameplay assertions.
- Continue intelligent through-ball interception and counterable Magic Trick reads, then goalkeeper, existing-player Studio graphics, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Main at start: `e233a6edcd3b0fcfd4bf6d6b588024287248617c`.
- Dev parent at start: `91d5b516c47cd93307f2b18c2c1a26b75fbd591d`.
- Pre-repair dev head: `900400468e294ce4a13da2817c118106895db11a`; metadata repair commit follows this checkpoint.

## Evidence
- .396 Modular QA #46107783779: passed on parent head.
- .396 Full Regression Census #46107783663: all eight shards passed; .396 was promoted to main as `91d5b516c47cd93307f2b18c2c1a26b75fbd591d`. Pages deployment #46108533164 succeeded; main Census #46108538549 had hosted smoke/preflight/preview and Node shards 2/3 passed, with remaining shards still running.
- .397 first exact-head Modular QA #46108696420 and Census #46108696431 failed preflight on four README-heading/version contract assertions (3,058/3,062 Node pass); both new gameplay Node regressions passed. Browser shards skipped. This correction updates the README project heading to .397 without weakening tests.
- Local git clone was unavailable because this runtime could not resolve github.com; use connected GitHub source and exact-head Actions diagnostics, and report local tests as not run.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
