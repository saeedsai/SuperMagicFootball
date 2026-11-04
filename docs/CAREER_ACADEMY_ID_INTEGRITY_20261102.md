# Career academy player identity integrity — 2026-11-02

## Acceptance criteria

- A scouted player must have a valid stable ID before signing.
- A scouted player's ID cannot already belong to any current squad member, including numeric/string equivalents.
- Rejected candidates leave the roster, scouting list, and budget unchanged.
- Standalone and modular Career APIs remain aligned.

## Change

Career academy signing now validates the candidate's stable ID and rejects duplicates already present in the squad before computing or charging its fee. This closes the restore edge where malformed/legacy scouting data could bypass the deterministic scouting ID allocator and produce a Career roster with duplicate identities.

## Validation

- `node --test tests/career_academy_id_integrity.test.cjs tests/career_purchase_atomicity.test.cjs` — **7 passed, 0 failed**.
- Full Career Node suite (`tests/career_*.test.cjs` plus `tests/career.mjs`) — **156 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,812,386 JS characters; 4,890,268 HTML characters).
- Scoped `git diff --check` — passed.
- No roster data or save schema changes. No browser, physical-device, or hosted deployment claim is made.
