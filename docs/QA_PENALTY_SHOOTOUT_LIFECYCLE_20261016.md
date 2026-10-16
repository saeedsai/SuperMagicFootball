# QA-PENALTY-SHOOTOUT-LIFECYCLE — bounded playable-game acceptance

**Date:** 2026-10-16  
**Agent:** `gameplay-review-20261016-gpt6-pkqa`  
**Lock:** `qa-framework`  
**Base:** `23b76a6feb7184aa634338535476abc58595f59c`

## Gap and acceptance

The playable modular engine already has early mathematical clinching, five-round scorekeeping, and complete-pair sudden death. These important rules were not independently guarded by a targeted modern-engine acceptance suite. This batch adds focused **real source** Node method execution and Chromium desktop/simulated-touch match-level regression for:

- Five-round early clinch precisely when the trailing side cannot catch up; no extra phantom kicks.
- After 5–5, a sixth first-side kick alone **cannot** end the shootout; the second completes the pair. If still level at 6–6, continue to a full seventh pair.
- Winners on either side, correct full-time `pkScore` and `winner`, and preservation of regulation draw `score` for after-draw matches.
- Preservation of roster/player IDs, team plan, substitution counts, and exactly four existing action controls.
- No implication that local human goalkeeper control exists: `GameEngine.updatePK` still uses CPU keeper logic. [Issue #5](https://github.com/saeedsai/SuperMagicFootball/issues/5) remains separately open for a dedicated gameplay-engine change.

## Changes and tests

- `tests/penalty_shootout_lifecycle.test.cjs`: calls current `GameEngine.startPK/updatePK` method bodies verbatim inside a pure VM with deterministic inputs, including 14-kick seventh-pair scenario.
- `tests/penalty_shootout_lifecycle_browser_qa.py`: launches the generated modular game fixture, starts a real Quick Match, enters penalty mode and advances genuine PK engine updates for four outcomes on desktop and simulated touch. Uses the existing renderer/game; never implements a separate PK state machine.
- This document and a brief `NEXT_MILESTONES.md` checkpoint, no runtime edits.

## Commands

```sh
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/penalty_shootout_lifecycle.test.cjs
node --test tests/*.test.cjs
python3 tests/penalty_shootout_lifecycle_browser_qa.py
python3 tests/full_regression_runner.py --category node --shard-index 0 --shard-count 1
python3 tests/full_regression_runner.py --category browser --shard-index 0 --shard-count 1 --timeout-seconds 75
```

**Evidence status:** new source/tests require exact-source CI and Chromium execution; avoid treating prior green builds as passing this batch. Physical Android/iOS and genuine local gamepads remain outside simulated-touch browser scope.

## Next five bounded development iterations

1. Finish exact integrated Node and Chromium eight-shard acceptance and hosted PC/touch match smoke for this QA addition.
2. Once gameplay engine ownership opens, verify/fix Issue #7's substitution-event semantics without changing quotas.
3. Under an exclusive gameplay claim, implement human penalty goalkeeping for two-player local modes (Issue #5) with dedicated keeper steering and four-button input parity.
4. Add controlled pressure-aware first-touch reception mechanics (separately claimed) with normal-pass/keeper exclusions and seeded match QA.
5. Coordinate graphics-owner goalkeeper holds/distribution and first-touch/pass follow-through, then improve career coaching; preserve saved team IDs.

**Cleanup:** no archive deletion without usage/references audit; no generated fixtures or binary assets added to source.

## Tested integration checkpoint — 16 October 2026

GitHub `dev` includes the two new tests and census-discovery guard:

- Node core test committed in [25667525](https://github.com/saeedsai/SuperMagicFootball/commit/25667525dd89e7e9b34f08eb8aee7ba9d15062ed); browser test [f64b840f](https://github.com/saeedsai/SuperMagicFootball/commit/f64b840f326d9b324f1a6251d2c978d38ddd9eec).
- Two test-harness defects found and corrected: concatenate current class methods with a comma inside the VM object ([0fed09c6](https://github.com/saeedsai/SuperMagicFootball/commit/0fed09c63c42a9ee4528870b7ddc4d0f712f73dd)); convert cross-realm numeric score arrays into local arrays for strict Node comparison ([d1292c8f](https://github.com/saeedsai/SuperMagicFootball/commit/d1292c8f478e034bd0e9ffa499e8dceb09f3ebae)). No match-engine changes.
- Exact code [Modular QA #38914495445](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38914495445): **158/159 Node tests passed**, including all six PK lifecycle tests. Sole failure is unrelated `project_memory_contract.test.cjs` for `game-developer-6` identity. Prior run before the new test also failed for this same memory contract. [Issue #8](https://github.com/saeedsai/SuperMagicFootball/issues/8) tracks its owner-only correction; do not inspect or edit another agent's memory.
- `tests/master_contracts.mjs` now checks discovery of both new scripts and triggers the existing full regression on changed release-acceptance contracts ([21f32120](https://github.com/saeedsai/SuperMagicFootball/commit/21f32120882791402c2e9f72ff07ebd3b429fbe3)). [Full Regression Census #38914650232](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38914650232) reported **164 passing / one unrelated memory failure** at preflight, so Node and Chromium shards were correctly skipped. **Do not claim 8/8 or hosted PC/mobile success from this run.**
- The new Chromium browser script is present and discoverable, but was **not executed** because of the independent preflight failure. Public Pages deployment and physical mobile validation are not certified by this checkpoint.

**Release handover:** after the separate memory owner repairs its contract, rerun the standard QA plus full 4+4 census on the integrated exact source, inspect the browser cohort output and provide hosted desktop/simulated-touch smoke evidence. If Chromium exposes an actual penalty failure, fix only the QA-owned script unless the gameplay-engine claim is obtained for a production fix. Keep Issue #5 open for manual PK goalkeeper control.
