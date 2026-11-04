# Career player recovery atomicity — 2026-11-02

## Acceptance criteria

- Preserve the 500,000 recovery fee, up-to-25-point condition increase, and one-week injury reduction.
- Validate budget and fitness arithmetic before charging or replacing a player.
- Numeric-string legacy fitness values remain supported and normalize on success.
- Standalone and modular Career APIs stay aligned.

## Change

`recoverPlayer` now precomputes the resulting budget, condition, and injury weeks on a copied player before applying either change. Malformed numeric values and insufficient funds leave the Career unchanged; numeric-string legacy fitness data is converted rather than producing string arithmetic or `NaN`.

## Validation

- `node --test tests/career_recovery_atomicity.test.cjs` — **2 passed, 0 failed**.
- Full Career Node suite (`tests/career_*.test.cjs` plus `tests/career.mjs`) — **162 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,814,685 JS characters; 4,892,567 HTML characters).
- Scoped `git diff --check` — passed.
- No recovery price or save schema change. No browser, physical-device, or hosted deployment claim is made.
