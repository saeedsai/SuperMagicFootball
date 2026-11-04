# Career player training atomicity — 2026-11-02

## Acceptance criteria

- Preserve the existing 1.5 million training fee and XP gain formula.
- Normalize valid legacy numeric-string XP/level fields to numbers on a successful training action.
- Reject malformed player, facility, XP, level, or budget values before changing the Career.
- Standalone and modular Career APIs remain aligned.

## Change

`trainPlayer` now validates and computes the fee, XP, level-up and growth on a copied player before updating the squad and budget. Numeric-string XP and level values remain supported as legacy values but are normalized instead of concatenated. Invalid state and unaffordable training leave both the squad and cash unchanged.

## Validation

- `node --test tests/career_training_atomicity.test.cjs` — **2 passed, 0 failed**.
- Full Career Node suite (`tests/career_*.test.cjs` plus `tests/career.mjs`) — **160 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,813,773 JS characters; 4,891,655 HTML characters).
- Scoped `git diff --check` — passed.
- No training costs or save schema changed. No browser, physical-device, or hosted deployment claim is made.
