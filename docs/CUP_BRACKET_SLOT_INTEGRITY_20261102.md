# Cup bracket slot integrity — 2026-11-02

## Acceptance criteria

- A saved active knockout bracket contains only distinct participant IDs.
- No club appears more than once across matches and byes.
- The saved club remains in the active bracket.
- Malformed bracket rows are rejected before slot persistence or activation.
- Group/league and finished campaigns retain their existing slot behavior.

## Change

`CUP_SLOTS.validTournament` now validates knockout bracket structure using the same participant and uniqueness rules as the runtime tournament restore validator. It rejects foreign IDs, duplicate appearances, malformed pairs, empty stage labels, negative knockout cursors, and active brackets that omit the saved club.

## Validation

- `node --test tests/cup_bracket_slot_integrity.test.cjs tests/cup_save_slots.test.cjs tests/cup_winner_integrity.test.cjs` — **11 passed, 0 failed**.
- `node tests/continental.mjs` — passed for all **216** selectable teams and **151** generated solo campaigns.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,816,286 JS characters; 4,894,168 HTML characters).
- Scoped `git diff --check` — passed.
- No Cup save schema, bracket progression, or winner behavior changed. No browser, physical-device, or hosted deployment claim is made.
