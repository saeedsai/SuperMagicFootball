# Career Academy scouting atomicity — 2026-11-02

## Acceptance criteria

- Preserve the 2.5 million scouting fee, deterministic seed, candidate fields, and same-week unique IDs.
- Validate cash, Academy level, squad source, and scouting-list shape before committing.
- Failed scouting leaves budget and candidates unchanged.
- Standalone and modular Career APIs remain identical.

## Change

`scoutAcademy` now validates its prerequisites and builds the candidate before deducting funds or appending to the scouting list. Empty/malformed roster sources, invalid Academy levels, malformed scouting lists and bad budgets fail without partial charging. The current cost, seed, source-player lookup, and ID allocation rules remain intact.

## Validation

- `node --test tests/career_academy_scout_atomicity.test.cjs tests/career_growth.test.cjs` — **9 passed, 0 failed**.
- Full Career Node suite (`tests/career_*.test.cjs` plus `tests/career.mjs`) — **164 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,815,417 JS characters; 4,893,299 HTML characters).
- Scoped `git diff --check` — passed.
- No scouting cost or save schema change. No browser, physical-device, or hosted deployment claim is made.
