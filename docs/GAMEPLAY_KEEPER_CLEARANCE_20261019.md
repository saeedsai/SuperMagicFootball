# Keeper long-clearance safety — 19 October 2026

## Scope
Feature GAMEPLAY-KEEPER-SAFE-CLEARANCE; lock gameplay-engine; owner smf-hourly-dev-20261019.

## Change
In `src/modules/engine.js`, `keeperClearanceTarget()` now rejects a teammate when `keeperPassingLane()` reports `clear:false`. Previously every advancing teammate could compete in long-clearance scoring regardless of defenders on the route or at the receiver. Open-turf corridors remain candidates; existing short keeper passes, manual direction controls, team data, and physics are untouched.

## Regression added
`tests/keeper_clearance_safety.test.cjs`: six Node cases for mirrored teams, marked receiver exclusion, empty-turf fallback and safe receiver preservation. Existing keeper-roll tests should continue passing. Execute `npm run test:node` plus GitHub Modular Game Dev QA and Full Regression Census on the integrated commit.

## 19 October follow-up: regression harness repaired and source-level checks

The first new Node test accidentally concatenated two production object methods without a comma, which would fail to parse. Fixed the extraction by inserting a method separator before `keeperClearanceTarget` in commit `c69157efda0d71d3f856482bb7ad48d048dda24c`.

Verified against the current GitHub `dev` source and test text using an isolated V8 execution harness with Node-like assertions:
- Keeper clearance safety: **6/6 passed** (both sides, blocked receiver, open turf, safe receiver).
- Existing keeper ground roll: **9/9 passed**.
- About dynamic revision behavior: **7/7 passed**.
- About versioning policy: **3/3 passed**.
- **Total 25/25 isolated source-level checks passed, zero failures.**

These are not native `node --test` runs, a full repository build, GitHub Actions CI, or real browser/phone tests. Native Node/full regression and exact-SHA Pages verification remain required before merging to `main`. This distinction must be preserved in release reports.

## QA evidence / limits
Source commit `03f93a71312299be6be58ac920e40dfb6790431c`; tests commit `f6f43f94efa4b2a8e671a9367956b46b5b2c453e`. Test suite is committed but no post-change CI pass is confirmed here. Browser gameplay and physical phone verification not run. Prior run 39228663384 failed 1/294 Node cases from the agent index mismatch, fixed by `5e2f00c`. Do not merge to main before exact-head CI green.

## Remaining risks and next five bounded iterations
1. Verify all six new tests, active Node suite and full browser census on exact dev SHA; repair failures.
2. Calibrate keeper clearance under pressure with seeded live ball/defender scenarios.
3. Improve keeper glove grip and recovery animation (graphics ownership required).
4. Refine first-touch and directional pass follow-through (claim gameplay + graphics as needed).
5. Improve career substitutions/coaching feedback, then review LAN multiplayer architecture as a separately scoped major feature.

No unrelated file cleanup: old QA evidence may be referenced by regressions.
