# Career backup overwrite confirmation type — 2026-11-02

## Acceptance criteria

- Importing into an occupied Career vault requires an explicit boolean `overwrite: true`.
- Truthy non-boolean values cannot bypass the occupied-vault confirmation guard.
- Invalid options are rejected before parsing or writing a replacement vault.
- Existing backup import, preview, validator, and rollback behavior remains intact.

## Change

`CAREER_SLOTS.importBackup` now validates its options object and requires `overwrite` to be a boolean. Previously, a caller passing a truthy string such as `"false"` would satisfy JavaScript's truthiness check and replace all occupied Career slots without the required confirmation.

## Validation

- `node --test tests/career_backup_integrity.test.cjs` — **10 passed, 0 failed**.
- Full Career Node suite (`tests/career_*.test.cjs` plus `tests/career.mjs`) — **152 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,811,850 JS characters; 4,889,732 HTML characters).
- Scoped `git diff --check` — passed.
- No save schema or UI behavior change. No browser, physical-device, or hosted deployment claim is made.
