# Career completed-season archive duplicate integrity — 3 November 2026

## Change

Season rollover used any object with matching `season` and `clubId` as proof that a season had already been archived. A partial or malformed legacy row could therefore suppress the complete snapshot immediately before rollover cleared the standings. Both the modular and standalone Career implementations now recognize a duplicate only when the row contains the full generated archive shape. Existing legacy rows remain preserved and visible through the existing read-only accessor.

## Validation

- `node --test tests/career_season_archive.test.cjs` — **4/4 passed**, including a malformed duplicate marker and modular/standalone parity.
- `node --test tests/career_*.test.cjs tests/career.mjs` — **174/174 passed**.
- `python -X utf8 scripts/build.py` — passed; fixtures generated from the modular source.
- `git diff --check` on changed source/tests/evidence — passed.

No roster, player identity, growth rule, season economy, or save schema changed. No browser or deployment acceptance is claimed.
