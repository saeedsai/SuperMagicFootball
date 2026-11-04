# Career transfer identity integrity — 2026-11-02

## Acceptance criteria

- A market player must have a stable, nonempty string or nonnegative safe-integer ID before quote or purchase.
- Quote and purchase use the same identity comparison, including numeric/string representations of the same ID.
- Duplicate or missing IDs fail before roster, market data, or Career finances change.
- Both standalone and modular Career APIs remain aligned.

## Change

Career transfer validation now rejects market candidates without stable IDs and compares valid IDs by their string form. This prevents a Career with numeric legacy ID `12` from signing the same player again from a market record using string ID `"12"`, and ensures purchase matches the quote's duplicate decision.

## Validation

- `node --test tests/career_transfer_id_integrity.test.cjs tests/career_transfer_quote.test.cjs tests/career_purchase_atomicity.test.cjs` — **14 passed, 0 failed**.
- Full Career Node suite (`tests/career_*.test.cjs` plus `tests/career.mjs`) — **154 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,812,164 JS characters; 4,890,046 HTML characters).
- Scoped `git diff --check` — passed.
- No roster data or save schema changes. No browser, physical-device, or hosted deployment claim is made.
