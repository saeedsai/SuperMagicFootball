# Cup participant ID precision integrity — 2026-11-02

## Acceptance criteria

- Participant IDs persisted by Cup slots are nonnegative safe integers.
- An unsafe ID is rejected before save, backup preview, or import can persist it.
- Valid tournament participants and existing legacy saves remain supported.

## Change

`CUP_SLOTS.validTournament` now requires participant IDs to be safe integers. `Number.isInteger` also accepts values at and above `2**53`, where adjacent team IDs can no longer be represented precisely; an edited/rechecksummed backup could otherwise persist a phantom participant when imported without an attached team-list validator.

## Validation

- `node --test tests/cup_participant_id_integrity.test.cjs tests/cup_save_slots.test.cjs tests/cup_backup_integrity.test.cjs` — **19 passed, 0 failed**.
- Full Cup Node suite (`tests/cup_*.test.cjs`) — **61 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,819,564 JS characters; 4,897,446 HTML characters).
- Scoped `git diff --check` — passed.
- No tournament winner, bracket, schedule, or save-schema behavior changed. No browser, physical-device, or hosted deployment claim is made.
