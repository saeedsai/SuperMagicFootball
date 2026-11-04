# Cup standings table slot integrity — 2026-11-02

## Acceptance criteria

- Participant table rows are non-array objects.
- Any present `p/w/d/l/gf/ga/pts` counter is a nonnegative safe integer.
- When all counters are present, played/record and points totals are internally consistent.
- Legacy incomplete table objects remain restorable; valid completed rows roundtrip unchanged.
- Malformed rechecksummed backups are rejected before writes.

## Change

`CUP_SLOTS.validTournament` now validates present standings counters and the complete-row equations before accepting a save. Previously, arrays and string/negative counters passed the structural object check, then tournament updates could concatenate values or corrupt standings. Incomplete legacy row objects remain accepted for compatibility.

## Validation

- `node --test tests/cup_table_slot_integrity.test.cjs tests/cup_backup_integrity.test.cjs tests/cup_save_slots.test.cjs` — **20 passed, 0 failed**.
- Full Cup Node suite (`tests/cup_*.test.cjs`) — **64 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,821,788 JS characters; 4,899,670 HTML characters).
- Scoped `git diff --check` — passed.
- No Cup save schema or gameplay scoring rule changed. No browser, physical-device, or hosted deployment claim is made.
