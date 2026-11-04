# Career match-fitness report integrity — 3 November 2026

## Acceptance criteria

- Invalid or malformed match-fitness rows must be rejected before any Career player or finance state is changed.
- Preserve valid report results, the existing recovery formula, injury calculation, and Career save fields.
- Keep the change local to Career fitness processing and avoid roster identity/stat edits.

## Change

Both `src/modules/career.js` and the standalone `src/career.js` now validate the transient engine report array and each row's stable ID shape, nonnegative finite seconds, fatigue in `[0,1]`, and condition in `[0,100]` before building the lookup or mutating players. This prevents invalid numeric report values from persisting `NaN` condition and prevents partial roster updates when a later report row is malformed. Valid reports continue through the existing match-fitness and rest-day recovery behavior unchanged.

## Validation

- Focused Career fitness, recovery, training, and energy tests: **12/12 passed**.
- Full Career Node suite, including both modular and legacy integrity regressions: **177/177 passed**.
- `node tests/career.mjs`: passed the 83-club/12-player Career scenario through training, transfer, Cup, league, and season rollover.
- Full project Node suite: **1,809/1,809 passed** plus the club fixture.
- Data validation: 223 teams, 2,676 players, 84 avatar presets; zero errors.
- `python -X utf8 scripts/build.py`: passed.
- Scoped `git diff --check`: passed.

## Scope note

The legacy source API is covered for parity as well as the modular runtime used by the game. No UI, balance, identity, save-schema, or storage behavior changed. Browser/device and hosted acceptance are separate.
