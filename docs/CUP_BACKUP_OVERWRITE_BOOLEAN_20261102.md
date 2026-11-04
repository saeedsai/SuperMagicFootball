# Cup backup overwrite confirmation type — 2026-11-02

## Acceptance criteria

- Importing a Cup backup into an occupied vault requires `overwrite: true` as an actual boolean.
- Truthy non-boolean values cannot bypass the all-slot overwrite guard.
- Invalid import options are rejected before parsing or persistence.
- Existing backup preview, validation, and rollback behavior remains intact.

## Change

`CUP_SLOTS.importBackup` now validates its options object and requires the overwrite confirmation to be a boolean. Previously, a truthy string such as `"false"` bypassed the check and could replace every Cup save slot without explicit confirmation.

## Validation

- `node --test tests/cup_backup_integrity.test.cjs` — **12 passed, 0 failed**.
- `node --test tests/cup_save_slots.test.cjs tests/cup_winner_integrity.test.cjs` — **9 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,815,660 JS characters; 4,893,542 HTML characters).
- Scoped `git diff --check` — passed.
- No Cup save schema or UI behavior change. No browser, physical-device, or hosted deployment claim is made.
