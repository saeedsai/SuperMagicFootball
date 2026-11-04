# CPU finishing priority input validation — 2026-11-02

## Behavior

The AI shot-priority helper now returns zero for missing, non-finite, or negative shot distances. Previously `NaN` and other coercible invalid values could become zero through `Number(distance) || 0`, incorrectly giving the CPU a close-range finishing priority. Finite numeric values and non-empty numeric strings retain the existing behavior, including the 710-unit inclusive boundary, pressure weighting, and mirrored shot-distance parity.

The unused AI module import was removed from `shotfeel.js`; this also allows the pure helper module to be exercised directly in Node without changing runtime behavior.

## Files

- `src/modules/shotfeel.js`
- `tests/ai_finishing_priority.test.cjs`

## Validation

- `node --test tests/ai_finishing_priority.test.cjs` — **1 passed, 0 failed**.
- `node tests/active_pursuit_ground_shots.mjs` — **PASS** (existing live-engine CPU pursuit, keeper distribution, and airborne-super trajectory checks).

This is deterministic local validation; no physical-device or hosted acceptance is claimed.
