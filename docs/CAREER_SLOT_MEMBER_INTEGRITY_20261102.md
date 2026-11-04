# Career slot save integrity — 2026-11-02

## Acceptance criteria

- A Career slot's club is a nonnegative integer included in a nonempty member list.
- Member IDs are nonnegative integers and unique.
- The saved week cursor is a nonnegative safe integer; legacy saves with incomplete fixture schedules remain restorable.
- A saved roster contains exactly twelve player objects with nonempty stable IDs, and IDs are unique.
- Invalid membership, week cursors, or roster identities are rejected before slot creation or mutation.
- Existing valid Career slot saves and legacy migration continue to work.

## Change

`CAREER_SLOTS.validCareer` checks internal club/membership consistency, requires a nonnegative safe-integer week cursor, and requires twelve roster players with valid, unique IDs before a save is written. IDs may be nonempty strings (including generated youth IDs) or nonnegative safe integers. Duplicate values are compared by their string form so numeric and string representations of the same ID cannot collide. Previously, malformed roster entries and duplicate/missing player IDs could pass slot validation and break stable-ID dependent Career operations after restore. Legacy slots with incomplete schedules remain restorable; progression itself validates the current round before applying a result.

## Validation

- `node --test tests/career_save_slots.test.cjs tests/career_backup_integrity.test.cjs tests/career_startup_restore_validation.test.cjs tests/career_slot_duplicate.test.cjs tests/career_slot_rename.test.cjs` — **41 passed, 0 failed**.
- Regressions verify empty, absent-club, duplicate, negative and nonnumeric member IDs; negative and unsafe week cursors; and null, missing, blank, malformed, or duplicate player IDs all fail before storage writes. Valid member lists, a completed season at the schedule boundary, a legacy slot with incomplete fixtures, and a twelve-player roster with unique IDs still save.
- `npm run build:qa` was attempted, but the bundled Python 3.13 process used Windows CP1252 when reading an existing UTF-8 data file and failed with `UnicodeDecodeError` (`0x81`). Re-run with Python UTF-8 mode to distinguish this environment encoding issue from a build failure.
- No UI, save-schema or roster data changes. No browser, physical-device, or hosted deployment claim is made.
