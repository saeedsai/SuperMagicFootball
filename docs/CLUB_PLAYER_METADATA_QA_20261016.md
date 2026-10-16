# SuperMagic Football — Brighton player metadata QA checkpoint (16 October 2026)

## Scope and commits
- **Source/data correction commit:** [cb6f24dc0bac9210ed78fa7ca83a240e432d941f](https://github.com/saeedsai/SuperMagicFootball/commit/cb6f24dc0bac9210ed78fa7ca83a240e432d941f)
- **Next documentation-only source-evidence refinement:** [8f7a332ee5426e679dcdc8db39a8e5b37ec0980c](https://github.com/saeedsai/SuperMagicFootball/commit/8f7a332ee5426e679dcdc8db39a8e5b37ec0980c). No runtime or roster edits after cb6f24d.
- **Batch:** `CLUB-20261016-BHA-METADATA-1` — all 12 Brighton squad members, 44 player metadata fields (11 ages, 11 historical/current shirt numbers, 9 sourced heights, 2 nationality spellings, and 11 shirt-verification indicators).
- Aston Villa batch retained verbatim; original 165-club/1,980-player name/role/OVR history ledger untouched.

## Test evidence

| Test gate | Observed result | Evidence |
|---|---|---|
| Data validation | PASS: no JSON errors | [Modular Game Dev QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38878411097) |
| 165-club parity, 1,980 players, 2GK/3DF/4MF/3FW and immutable history | PASS | Same modular QA workflow |
| Active `node --test` suite, including Brighton and Aston Villa | **59 PASS / 0 FAIL** | Same modular QA workflow |
| Full historical Node regression | **94 PASS / 0 FAIL / 0 TIMEOUT / 0 ERROR** (4 shards) | [Full Regression Census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38878411037) |
| Full historical browser regression | **50 PASS / 0 FAIL / 0 TIMEOUT / 0 ERROR** (4 Chromium shards) | Same Full Regression Census |
| **Full historical script census** | **144 PASS / 0 FAIL** | Same Full Regression Census |
| GitHub Pages deployment on source commit | **SUCCESS** | [Pages source deployment](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38878410705) |
| GitHub Pages deployment on subsequent docs-only commit | **SUCCESS** | [Pages after provenance refinement](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38878755163) |
| Hosted actual live browser PC and touch on exact revision | **NOT VERIFIED**; automated live-smoke is not triggered by player-data-only edits | [Game](https://saeedsai.github.io/SuperMagicFootball/) |

Both active QA and full regression passed on the exact source/data revision. Subsequent documentation-only revisions did not modify any gameplay or player values. Pages success confirms published build status, *not* physical mobile behavior. Previous hosted desktop/touch smoke runs covered earlier runtime revisions, so no claim of fresh hosted smoke is made.

## Residual issues
1. **Brighton current membership:** Carlos Baleba was in Brighton's 20 August 2026 list as #17 but in Manchester United's 22 September 2026 Premier League list as #20. This is a real, dated registration discrepancy. The previous Brighton game slot has been left intact pending the requested independently source-ranked 2/3/4/3 roster replacement with new immutable selection batch; do not call Brighton squad verified for current club.
2. **Heights conflict:** Jason Steele 190 cm (FBref/StatMuse) vs 188 cm (Sky Sports) vs 185 cm (Soccerbase); 190 cm stored with provenance, but precise height is contested. Mats Wieffer 188 cm (old Premier League profile) vs 189 cm (current StatMuse); no height filled pending resolution.
3. **Remaining Club26 metadata:** 109 populated ages disagree with known birth-date calculations at 2026-10-16; 205 ages missing; 370 height entries missing. These are **32 Club26-club** counts, not the whole 165-club inventory.
4. Official FC27 source-ranked ratings/attribute verification is not yet complete; the 983 FC27 club ratings still originate from an unofficial third-party data snapshot and 997 are editorial. No speculative rating or gameplay-stat edits were made.
5. Do not delete historical test fixtures/docs while GitHub Actions and other agents use them; cleanup was restricted to relevant corrective documentation.

## Next five isolated batches
1. Resolve Brighton Baleba registration/position selection with a replacement evidenced by league roster and official FC27 provenance if available, preserving IDs and recording name/role/OVR changes in existing immutable 1,980-slot ledger; re-run all suites.
2. Borussia Dortmund — eight inconsistent age records, official first-team registration and heights.
3. Napoli — eight inconsistent ages, nationality, player sources and physical stats.
4. Everton — seven inconsistent ages, latest 2026/27 squad membership and shirt numbers.
5. Inter Milan — six inconsistent ages and role/physical-rating provenance.

**Continuation protocol:** On each new run read live `dev` HEAD plus `docs/PLAYER_METADATA_BATCHES_20261016.json`, `docs/CLUB_ROSTER_BATCH_LEDGER_20261016.json` and `docs/CLUB_ROSTER_BATCH_PLAN_20261016.md`, select only untouched records, verify sources, update runtime/data symmetrically, run CI, and push with expected-head protection. No football gameplay changes.
