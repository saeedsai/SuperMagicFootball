# Cup league cursor integrity — 2026-11-02

## Acceptance criteria

- An active Cup league with a nonempty saved schedule points to an existing round.
- An out-of-range cursor is rejected before slot save, preview, import, or activation.
- Finished campaigns keep their historical cursor, and legacy campaigns with an empty schedule remain restorable.

## Change

`CUP_SLOTS.validTournament` now checks that an active league's `roundIdx` is inside a nonempty `rounds` array. Previously, a malformed or rechecksummed backup could contain `roundIdx === rounds.length`; structural slot validation accepted it, but no next fixture could be selected. The check is limited to active league campaigns to preserve finished-state metadata and legacy empty-schedule saves.

## Validation

- `node --test tests/cup_league_cursor_integrity.test.cjs tests/cup_save_slots.test.cjs tests/cup_backup_integrity.test.cjs` — **19 passed, 0 failed**.
- Full Cup Node suite (`tests/cup_*.test.cjs`) — **59 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,818,303 JS characters; 4,896,185 HTML characters).
- Scoped `git diff --check` — passed.
- No Cup schedule generation, save schema, bracket, or winner behavior changed. No browser, physical-device, or hosted deployment claim is made.
