# Career facility upgrade integrity — 2026-11-02

## Acceptance criteria

- Preserve the existing facility purchase price: current level multiplied by 12.5 million.
- Reject invalid facility levels, non-finite/negative budgets, or unrepresentable results before changing Career state.
- Keep the standalone and modular Career APIs aligned.
- Preserve atomicity on insufficient funds and malformed state.

## Change

`upgradeFacility` now validates the facility state, current level, budget and computed result before updating the Career. It preserves the existing cost formula and applies the new level through a copied facilities object only after all checks pass.

## Validation

- `node --test tests/career_facility_upgrade_integrity.test.cjs` — **2 passed, 0 failed**.
- Full Career Node suite (`tests/career_*.test.cjs` plus `tests/career.mjs`) — **158 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,812,941 JS characters; 4,890,823 HTML characters).
- Scoped `git diff --check` — passed.
- No facility prices, save schema, or roster data changed. No browser, physical-device, or hosted deployment claim is made.
