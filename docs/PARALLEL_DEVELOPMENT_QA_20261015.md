# Parallel-work integration QA — 15 October 2026

## Source of truth

Built against the `dev` lineage whose inspected head was `a42ce51cc1cee1c276a90b260a3e05e6285526e1` (FC27 probing + graphics comparison commits). All prior Club26 squad corrections, character-art v2 renderer, eight-view Studio and full-regression fixes are preserved. New code is development tooling, tests and docs; **no** gameplay, roster, saved-state or graphics runtime values have been changed.

## New capability

`scripts/parallel_data_merge.py`: a conservative, path-specific three-way merger for team, roster, appearance, procedural graphics and mechanics JSON. Reports conflicts before writing output and protects stable team/player IDs and ordering. See [PARALLEL_DATA_MERGE_GUIDE.md](PARALLEL_DATA_MERGE_GUIDE.md).

## Test evidence

- Local Python 3 `unittest` suite: **11 passed, 0 failed**, including subprocess CLI dry run, output prevention on conflicts, same-field disagreements, and safe combining of disjoint fields.
- GitHub `Modular Game Dev QA` now runs the new tests on every `dev` push, in addition to JSON validator, regenerated browser fixture, existing Node suite and Python syntax checks.
- GitHub `Full Regression Census` workflow now triggers on this merger, new tests and docs; its preflight runs the 11 tests, existing Club26 roster contract and the existing Node suites; four Node and four Chromium shards then perform the full discovered-script run.
- **CI status**: See the commit's GitHub Actions run; do not copy historical counts as proof of the current commit. Any workflow still pending is NOT EXECUTED/UNVERIFIED in the release summary.
- GitHub Pages deployment is an operational check only; it does not certify human interaction, persistence or physical-device behavior.

## Risks and residual limitations

Automated merge diagnostics cannot judge conflicting editorial content or validate real-world FC27 data. A successful three-way merge is a **candidate**, not an automatic change to production. Final roster/appearance parity, application-specific invariants and browser regression must still be checked before merging to `dev`. In particular, the tool rejects any roster identity/order rework rather than attempting to migrate saved games.

All prior protected game specifications remain: 223 teams, 2,676 players, seven BPW squads, fixed 2GK/3DF/4MF/3FW per team, five top-level menu sections, four action buttons and six formations. Physical devices and exhaustive live-origin save/PWA checks remain far-future, per the owner.