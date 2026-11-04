# Cup league round slot integrity — 2026-11-02

## Acceptance criteria

- Every pair in a nonempty active league schedule contains two distinct participant IDs.
- A participant appears at most once in each round.
- Malformed round entries are rejected before save, preview, import, or activation.
- Legacy empty schedules remain readable, and a valid complete schedule roundtrips.

## Change

`CUP_SLOTS.validTournament` now validates nonempty league schedule rounds for pair shape, participant membership, and per-round uniqueness. Previously, a `null`/object round or malformed fixture pair could pass structural save/import validation; later fixture selection could stall or throw. Empty legacy schedule arrays remain accepted.

## Validation

- `node --test tests/cup_league_round_slot_integrity.test.cjs tests/cup_backup_integrity.test.cjs tests/cup_save_slots.test.cjs` — **20/20 passed**.
- Full Cup Node suite (`tests/cup_*.test.cjs`) — **67/67 passed**.
- `python -X utf8 scripts/build.py` — passed; built inherited test fixtures from modular runtime (4,822,538 JS chars; 4,900,420 HTML chars).
- `git diff --check -- src/modules/cup_slots.js tests/cup_league_round_slot_integrity.test.cjs docs/CUP_LEAGUE_ROUND_SLOT_INTEGRITY_20261102.md` — passed with no whitespace errors.
- No Cup schedule generation, save schema, bracket, or winner behavior changed. No browser, physical-device, or hosted deployment claim is made.
