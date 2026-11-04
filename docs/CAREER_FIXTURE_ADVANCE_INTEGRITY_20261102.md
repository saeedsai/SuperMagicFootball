# Career fixture advance integrity — 2026-11-02

## Acceptance criteria

- League advancement validates the active round before setting `lastResult` or changing standings, finance, player progression, or history.
- Every round entry has two distinct member IDs, and a member cannot appear twice in the same round.
- Exactly one active fixture includes the Career club.
- Every participating club has a complete, nonnegative integer standings row before the advance.
- Valid league results and pending Cup fixtures retain their existing behavior in both Career APIs.

## Change

The standalone and modular Career APIs now preflight the league round and all participant standings rows before advancing a result. Corrupt match pairs, repeated participants, absent player fixtures, unavailable table rows, and invalid counters fail with a clear error before any Career state is mutated. Cup-pending fixture handling is left on its existing path.

## Validation

- `node --test tests/career_fixture_integrity.test.cjs tests/career_match_result_validation.test.cjs` — **5 passed, 0 failed**.
- Full Career Node suite (`tests/career_*.test.cjs` plus `tests/career.mjs`) — **151 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed; generated inline fixture from current modular runtime (4,811,601 JS characters; 4,889,483 HTML characters).
- Scoped `git diff --check` — passed.
- No save schema or roster data changes. No browser, physical-device, or hosted deployment claim is made.
