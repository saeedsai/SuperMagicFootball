# CPU pass target range boundary — 2026-11-02

## Behavior

CPU pass target selection now includes a teammate exactly at the configured maximum distance. A target beyond the limit remains excluded, and the existing minimum separation, forward alignment, and preference for a reachable nearby option remain intact. The eligibility boundary works the same in both attack directions.

## Files

- `src/modules/shotfeel.js`
- `tests/ai_pass_target_range.test.cjs`

## Validation

- `node --test tests/ai_pass_target_range.test.cjs` — **2 passed, 0 failed**.
- `node --test tests/ai_finishing_priority.test.cjs` — **1 passed, 0 failed**.
- `node tests/active_pursuit_ground_shots.mjs` — **PASS** for the existing live-engine CPU pursuit/keeper-distribution/airborne-shot cohort.

This is deterministic local validation; physical-device and hosted acceptance were not run.
