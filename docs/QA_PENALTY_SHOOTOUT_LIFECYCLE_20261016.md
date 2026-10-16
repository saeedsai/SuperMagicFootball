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
