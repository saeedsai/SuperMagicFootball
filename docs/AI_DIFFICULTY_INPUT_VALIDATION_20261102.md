# AI difficulty input validation — 2026-11-02

## Behavior

AI tuning now accepts finite numeric values and non-empty numeric strings. Finite values continue to truncate and clamp to the five configured CPU profiles. Missing or malformed values use Normal (level 2); `null`, booleans, empty strings and objects no longer coerce to level 0 (Rookie).

This keeps absent/corrupt option data from silently changing the opponent difficulty while retaining saved numeric-string compatibility.

## Files

- `src/modules/ai.js`
- `tests/ai_tuning_input.test.cjs`

## Validation

Command: `node --test tests/ai_tuning_input.test.cjs`

Result: **1 passed, 0 failed**. The test evaluates the active module helper against the configured five-level catalog and covers numeric levels/strings, clamping, fractional truncation, nullish values, booleans, blank/nonnumeric strings, non-finite numbers, arrays, objects, and symbols.

This deterministic helper test does not claim full match-balance or physical-device acceptance.
