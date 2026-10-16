# First-touch pressure settling — bounded gameplay feature
**Date:** 2026-10-16 · **Feature:** `GAMEPLAY-PRESSURE-FIRST-TOUCH-CONTROL` · **Exclusive lock:** `gameplay-engine` · Owner: `gameplay-firsttouch-20261016-gpt6-r4`

## Delivered on the actual playable engine
When an outfield player receives a **friendly ground-level teammate pass** within proximity of an active opponent, the ball carrier takes a brief (`0.24 s`) settling step and cannot instantly burst to full sprint. The penalty scales continuously with defender proximity and with the receiver's **existing dribbling attribute**: higher skill cushions more gracefully. This is deterministic, capped to at most 32%, and decays to exactly normal movement; there is no RNG, event duplication, tackle lock, forced pass failure or ball acceleration.

This does not trigger on passes in open space, opposing interceptions, aerial catches, goalkeeper possession or ordinary loose-ball acquisition. A new match/spawn and substitutions clear the timer. `moveAgile` only uses the modifier while that exact player owns the ball; losing/releasing possession immediately restores unchanged movement. Players can still pass, shoot, dribble and jump immediately; the live passing target, shot velocities and existing four controls remain intact.

## Scope and acceptance
- Only `src/modules/engine.js`: one pure time/pressure/skill multiplier, a 0.24-second receipt flag, the existing player movement and timer loop, and substitution/new-roster reset.
- New `tests/first_touch_control.test.cjs`: source-executed normal/open/pressure/interception/air/keeper, actual `moveAgile`, cancellation, event, timer and clamp contracts.
- New `tests/first_touch_control_browser_qa.py`: real modular Quick Match desktop and simulated touch, teammate pass followed by pressured first touch, actual engine slow-vs-normal movement, unchanged team/formation/score/buttons and immediate shot.
- This scoped handover and current own-agent checkpoint. All physics config, input/UI, graphics/audio, rosters, stored save keys, build system, QA runner and CI untouched.

## Test status
The standard GitHub Modular Game Dev QA, full 4+4 Node/Chromium census and hosted desktop/touch public Quick Match must be checked **after merge**. Do not treat a scheduled/cancelled run as a pass. Per-commit development revision is the automatic latest `dev` SHA in About; release bundle version remains unchanged.

## Next five small iterations
1. Measure 30/60/120 Hz and both-team mirror first-touch settle windows and collisions; tune only after observing failures.
2. Measure goalkeeper saves against ordinary and nonlinear Super Shots, controlled seeds, side and fatigue symmetry.
3. Advance eight-direction keeper glove/ball distribution animation under free graphics ownership.
4. Improve coaching advice and substitutions under free UI ownership, preserve tactical saves.
5. Deliver deeper league/career and original mode parity including local Versus goalkeeper penalties; separately certify physical handset, PWA and multiplayer.

## Cleanup
No unverified removal of historical assets, templates or QA logs. Retain generated-file exclusions and defer broader cleanup to an owner of the relevant directory.

## Intermediate exact-source CI evidence (independently verifiable)

- [Feature merge commit `c0b87bc8ab4ebef73beaa4cce68f59a777b47416`](https://github.com/saeedsai/SuperMagicFootball/commit/c0b87bc8ab4ebef73beaa4cce68f59a777b47416) — four scoped files; no UI, renderer, roster, saved-game or release-infrastructure changes. Each Git commit has a unique on-open About `dev` revision; bundle version is unchanged.
- [Modular Game Dev QA #38959752554](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38959752554) **COMPLETED SUCCESS**: 215/215 active Node subtests, 20/20 Python merge, 10/10 claim checks, 165-club provenance audit/JSON and About/versioning guard tests passed.
- [Keeper Save Event Integrity #38959752518](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38959752518) **SUCCESS**; no goalkeeper changes introduced.
- Initial [hosted PC/simulated touch smoke #38959752463](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38959752463) **SUCCESS**, but ran before confirmed deployment of this gameplay commit; it cannot serve as final hosted feature acceptance.
- Exact merge [Full Regression Census #38959752506](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38959752506) **CANCELLED** under parallel GitHub Actions concurrency. Follow-up [descendant 4+4 regression #38960061389](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38960061389) has passed preflight and all four Node shards; browser shards and overall conclusion still require confirmation. At descendant commit `d33410af`, an ancestry comparison confirmed the feature is included and `src/modules/engine.js` unchanged.
- Cleanup audit: 717 tracked paths at checkpoint, **zero** committed `__pycache__`, `node_modules`, `.generated`, `test-results`, `playwright-report`, `.pyc`, `.bak`, `.tmp` and editor swaps. Older QA reports intentionally retained because prior evidence refers to them.

**Known release risk:** many other agents are pushing to shared `dev`, causing CI and Pages deployments to be cancelled by concurrency control. Do not assert a cancelled run passed or that the public Pages site contains this fix until a later successful descendant deployment plus browser smoke. Continue at next checkpoint from live claim, not archived memory.

## Later descendant regression: one independently owned browser-test failure

- [Full Regression Census #38960061389](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38960061389), descendant `d33410af8306f493cfe72f04a244b18be16e702e` (verified 5 commits after `c0b87bc8`, **no modifications to the feature's `src/modules/engine.js`**): completed **FAILURE** with **217/218 scripts passing**. All four Node shards: **35+35+35+35 = 140/140 PASS**; Chromium: shard 0 **20/20 PASS**, shard 1 **19/20 PASS**, shard 2 **19/19 PASS**, shard 3 **19/19 PASS**, total **77/78 PASS**.
- The new **`first_touch_control.test.cjs`** passed in Node shard 2 (0.08 seconds), and **`first_touch_control_browser_qa.py`** passed in Chromium shard 0 (4.47 seconds) across desktop and simulated touch; both test the current real engine and real Quick Match flow.
- The **sole failure** was **`tests/pass_reception_audio_browser_qa.py`**, a separately added audio-QA script introduced *after* the gameplay feature merge: `Page.evaluate: Error: Game players unavailable` on its filter requiring 2 non-keepers plus an opponent after kickoff. This did **not** fail any of the new first-touch assertions and did not correspond to an engine source change. Tracked as [Issue #17](https://github.com/saeedsai/SuperMagicFootball/issues/17) with logs, debugging directions and owner coordination; do not edit audio/QA scripts under the concurrent `audio-feedback` scope.
- Source-specific [Modular QA #38959752554](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38959752554) and [keeper save integrity #38959752518](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38959752518) **SUCCESS**. [Hosted PC/touch smoke #38959752463](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38959752463) **SUCCESS** for public gameplay (HTTP 200, 224 teams, kickoff, +20% pitch), but **before a verified deployment containing this new first-touch source**. Concurrent pushes repeatedly cancelled this source's own Pages deployment; no claim of verified new-feature live deployment until a descendant Pages success + later hosted smoke.
- Current About policy: every Git commit's newest `dev` SHA is fetched on About open; established bundle version remains `0.8.25.32-integrated` and latest development revision does not identify deployed bytes. Physical handset testing not certified.

**Handover:** Code/tests/docs are merged to `dev`; the current gameplay lock can be released, and the unresolved separate audio regression remains [Issue #17](https://github.com/saeedsai/SuperMagicFootball/issues/17). No historical documents or source assets removed. The own agent-memory file had a concurrent update conflict, so was not overwritten or read beyond the session's initial bootstrap; preserve other agents' writes.
