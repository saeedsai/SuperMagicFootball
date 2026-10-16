# SuperMagic Football — Club Roster Batch Register and Handoff

**Updated:** 2026-10-16  
**Source branch:** [`dev`](https://github.com/saeedsai/SuperMagicFootball/tree/dev)  
**Authoritative ledger:** [`docs/CLUB_ROSTER_BATCH_LEDGER_20261016.json`](CLUB_ROSTER_BATCH_LEDGER_20261016.json)

## Current state

- **165 clubs**, 12 players per club (**1,980 total**); **2 GK + 3 DF + 4 MF + 3 FW**.
- **983** ratings tagged FC27, from an **unofficial September 2026 third-party dataset**.
- **997** source-backed real-player entries with **editorial game ratings** (not EA overall scores).
- **Zero** fictional/academy slots in the 165 clubs at the recorded snapshot.
- Game inventory outside these 165 club squads (national teams, legends, arcade teams, etc.) is a distinct scope and is not part of this club rating audit.

## Recorded completed replacement batches

The ledger compares the before snapshot from GitHub commit `7795f086fdc276c15e36bc76e842b5f83a3ffb22` with the full named squad snapshot from `800b91715bf6baec024e7793807fcead2f6a0d49`. It records **207 exact replacements in 23 clubs**, including each old/new name, position, old/new rating, roster slot and club-level source reference set. Stable roster slot identities were preserved; no position quota was modified.

| Immutable batch | Region | Clubs touched | Players replaced |
|---|---|---:|---:|
| `CLUB-20261015-AFC` | AFC | 6 | 31 |
| `CLUB-20261015-CAF` | CAF | 5 | 60 |
| `CLUB-20261015-CONCACAF` | CONCACAF | 5 | 41 |
| `CLUB-20261015-CONMEBOL` | CONMEBOL | 2 | 15 |
| `CLUB-20261015-OFC` | OFC | 5 | 60 |
| **Total** | | **23** | **207** |

The complete 1,980-player name/position/overall snapshot is stored as `currentRosterSnapshot` in the ledger. Earlier changes outside the 207-player comparison window are *not* retroactively represented as independently dated replacements; their latest states **are** preserved by the 1,980-player snapshot.

## Quality issues addressed in the bookkeeping batch

- Fixed `scripts/apply_verified_roster_gap_fixes.py` so repeated enrichment runs cannot multiply `+INDEPENDENT_2026_SQUAD` flags or duplicate source references.
- Removed **307 duplicated provenance fragments from 26 club records**, without modifying selected players.
- Added a permanent history validator and blob fingerprint. A new player, changed overall score, changed name or metadata edit is rejected in CI until the ledger is updated.
- Connected the check to the normal `Modular Game Dev QA` workflow and the comprehensive `Full Regression Census`.

## How to proceed with the next source-verification batch

1. **Select one region or a small group of clubs.** Review FC27 candidates for 2 GK / 3 DF / 4 MF / 3 FW and confirm affiliations/starting-squad roles from dated primary or reliable club sources. Distinguish strong published evidence from an inferred name. No guessed FC27 scores.
2. **Edit club data and runtime together.** Update `data/players/club26.json` and/or `data/players/continental.json`, plus the matching entries in `src/roster_corrections.js`. Update the per-club selected list and source references in `docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json`. Preserve each roster slot's stable game identifier where possible.
3. **Append a new immutable batch, never overwrite an old one.** Run:
   ```bash
   python3 scripts/advance_club_roster_batch.py \
     --batch-id CLUB-20261016-AFC-REVIEW-1 \
     --region AFC \
     --description "Rechecked club registration and role-ranked selection"
   ```
   This compares the previous immutable 1,980-player snapshot with the new roster, records each previous/new player and rating, and preserves all older changes. If only citations or the audit metadata changed, use `--refresh-provenance` instead.
4. **Validate the batch before committing or merging:**
   ```bash
   python3 scripts/advance_club_roster_batch.py --check
   python3 scripts/validate_data.py
   node tests/all_club_fc27_rosters.mjs
   node tests/club_roster_batch_ledger.mjs
   node tests/club26_fc27_roster.mjs
   python3 scripts/build.py
   node --test tests/*.test.cjs
   ```
   Do not mark a batch verified unless its corresponding GitHub Actions job is successful; preserve failure artifacts.
5. **Commit and push to `dev`.** Check normal and full regression workflows. Record the tested commit and source review status in this document. Check actual published GitHub Pages game separately—CI build success alone does not establish device/browser playback.

The two authoritative identifiers are `clubId + roster slot` (tracks the same game entry over time) and the GitHub audit blob SHA fingerprint (detects edits outside a named batch). Later batches may legitimately update a previously changed slot, but the tool preserves the before/after chain and refuses to recycle batch IDs.

## Future verification priorities

All 165 club slots are populated, but additional review is warranted for **2026/27 first-team registration, nationality/identity disambiguation, precise FC27 highest-OVR selection and source recency**. The 983 FC27 records are third-party and not EA-certified. The 997 editorial ratings should never be presented as FC27 ratings. A club-level source list provides useful provenance but does **not** conclusively verify every player on its own.

## Sources and audit evidence

- [All-club FC27 source and positional audit](CLUB_FC27_POSITIONAL_AUDIT_20261015.md)
- [Club-by-club selected rosters and citations](CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json)
- [Individual player modifications and five batch records](CLUB_ROSTER_BATCH_LEDGER_20261016.json)
- [Full regression CI](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/full-regression-census.yml)
- [GitHub Pages playable game](https://saeedsai.github.io/SuperMagicFootball/)

**Batch status as of the recorded snapshot:** All 207 replacements have been applied to `dev` with automated roster-source/runtime parity checks. An editorial rating is not a sourced EA rating and geographic grouping is not itself a proof of current club registration.


## Identity-only correction checkpoint — 16 October 2026

- **Batch:** `CLUB-20261016-AVL-METADATA-1` (Aston Villa, `club26_6`), five players and **11 verified attribute-level edits**: four corrected ages, five new centimetre heights, and two nationality display normalizations.
- **Immutable evidence:** [player metadata correction log](PLAYER_METADATA_BATCHES_20261016.json). Both `data/players/club26.json` and `src/roster_corrections.js` were updated. Ages use 2026-10-16 as reference, rather than an arbitrary source snapshot age.
- **Sources:** [UEFA Aston Villa current squad](https://www.uefa.com/nationalassociations/teams/52683/squad/), [Premier League player biographies](https://www.premierleague.com/en/players), [Transfermarkt 2026/27 detailed squad](https://www.transfermarkt.de/aston-villa/kader/verein/405/saison_id/2026/plus/1).
- **Selection invariants:** No names, FC27 identifiers, roles, ratings, 12-slot squads or team IDs were changed; the existing 207 name/OVR-replacement records and audit fingerprint remain intact. This is a separate **metadata-only batch** and must **not** be misrepresented as a newly selected-player batch.
- **Known follow-up:** The source age-check identified 122 stale populated age values in the 32 Club26 teams at the 2026-10-16 reference date. After this batch, 118 remain outside Aston Villa; absent ages and height values also need staged source checks. The 2026/27 club registration and shirt-number discrepancies, including Villa, require a separate, sourced selection review. Do not bulk edit unverified FC27 overall ratings.
- **Regression gate:** `node --test tests/club_player_identity_20261016.test.cjs`, `node tests/all_club_fc27_rosters.mjs`, `node tests/club_roster_batch_ledger.mjs`, `python3 scripts/validate_data.py`, full Node/Chromium CI, and hosted deployment must be checked on the resulting commit before marking the batch CI-verified.

### Identity audit next five iterations
1. Club26 age verification: Manchester United, Aston Villa remaining empty fields, and nearby high-confidence birth dates.
2. Remaining Club26 high-error teams: verify dates and repair stale ages in small tracked club sets.
3. UEFA clubs: source-backed nationality and height fields, preserving current FC27 shortlists.
4. Continental confederations: verify dated current-club registration, physical fields and editorial rating provenance.
5. Reconcile role/OVR selection against confirmed official FC27 if available; test 165 clubs, full regression and hosted desktop/touch.
