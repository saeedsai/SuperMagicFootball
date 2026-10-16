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

- **Batch:** `CLUB-20261016-AVL-METADATA-1` (Aston Villa, `club26_6`), five players and **12 verified attribute-level edits**: five verified ages (four corrected and one newly populated), five new centimetre heights, and two nationality display normalizations.
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


## Metadata batch 2 — Brighton / 2026-10-16

**Checkpoint:** `CLUB-20261016-BHA-METADATA-1`. The existing Aston Villa batch is preserved unchanged; `club26_12` Brighton is the second club to receive dedicated metadata corrections, following the user-requested small-batch process.

- Edited only player metadata for the 12 *existing* Brighton squad slots in `data/players/club26.json` and their exact `src/roster_corrections.js` runtime copies: 44 field changes on 12 players. The permanent per-field audit is in `docs/PLAYER_METADATA_BATCHES_20261016.json`.
- Applied ISO birth-date-derived ages at **2026-10-16**; corrected incorrect/absent age fields, real 2026/27 shirt numbers, two Dutch nationality labels, sourced height measurements and verified official shirt flags. No player name, role, OVR, FC27 IDs, face stats, power/shoot/defense/speed, formation, engine, UI or match logic was changed.
- Authoritative roster and shirt-number evidence: [Brighton 20 August 2026 announcement](https://www.brightonandhovealbion.com/media-article/mft-news-kit-numbers-premier-league-2026-27-season-august-2026), [Premier League 22 September 2026 squad register](https://www.premierleague.com/en/news/4725682/all-20-premier-league-clubs-squad-numbers-for-202627-season); [2026/27 player birth-date register](https://www.national-football-teams.com/club/703/2026_1/Brighton_Hove_Albion.html); [individual player physical attributes](https://www.statmuse.com/fc/club/2026-27-brighton-%26-hove-albion-22/roster/2027).
- **Unresolved registration conflict (DO NOT mark Brighton fully verified):** Carlos Baleba appears in Brighton's 20 August squad as #17 but in Manchester United's 22 September league listing as #20. His Brighton-game entry remains in its original slot until the separate, source-ranked replacement can be selected and the immutable name/role/OVR ledger advanced. Recorded explicitly in metadata checkpoint. The non-transfer player selection and third-party FC27 OVR need independent review.
- **Unresolved height difference:** Mats Wieffer is 188 cm in an older Premier League player profile and 189 cm in a contemporary StatMuse listing; retain unknown rather than guess.
- **CI gates:** `node --test tests/brighton_player_metadata_20261016.test.cjs`, `node tests/all_club_fc27_rosters.mjs`, `node tests/club_roster_batch_ledger.mjs`, `python3 scripts/validate_data.py`, Node/Chromium regression, and GitHub Pages desktop/touch smoke. No historical artifact removal while tests and other agents reference those files.
- **Future small batches:** (1) Brighton name/club/position and Baleba transfer resolution using the original immutable squad ledger; (2) Dortmund age/physical evidence; (3) Napoli; (4) Everton; (5) Inter Milan. Re-fetch the new `dev` head before every commit.


Source evidence caveat for Brighton: Jason Steele's height is 190 cm in FBref and StatMuse but 188 cm in Sky Sports and 185 cm in Soccerbase. A current-sourced 190 cm reading is stored, with conflict flagged for future manual confirmation. Age and nationality evidence in the player metadata ledger was refined without changing any player values.


## Batch 2 QA certification — 16 October 2026

The Brighton roster-data commit [cb6f24d](https://github.com/saeedsai/SuperMagicFootball/commit/cb6f24dc0bac9210ed78fa7ca83a240e432d941f) passed **59/59 active Node tests** and **144/144 full historical regression scripts** (94 Node + 50 Chromium), with zero failures/timeouts/errors; both source and documentation-only GitHub Pages deployments succeeded. Full evidence: [Brighton metadata test report](CLUB_PLAYER_METADATA_QA_20261016.md). These green checks do **not** resolve the separately documented Carlos Baleba transfer inconsistency or prove a new hosted physical-device playback. The next isolated player correction is Brighton club-registration selection, followed by Dortmund, Napoli, Everton and Inter Milan.


## Batch 3 — Dortmund identity audit (CLUB-20261016-BVB-METADATA-1)

The [Dortmund batch report](CLUB_PLAYER_METADATA_DORTMUND_20261016.md) documents 47 sourced age, height, shirt, and nationality metadata edits across 12 players. All non-player gameplay data, player selection, overall ratings and FC27 attributes were left unchanged. The official first-team registry reveals a forward/defender mismatch for Daniel Svensson, recorded as an **open roster-selection issue**, not silently fixed. New focused test: `tests/dortmund_player_metadata_20261016.test.cjs`. The next five independent steps are in the report; preserve older batch ledgers and avoid unrelated file removals.


## Verified Dortmund batch checkpoint (2026-10-16)

The metadata update in [commit 5fbac391](https://github.com/saeedsai/SuperMagicFootball/commit/5fbac39159069c0feba405f2c32c2f8d4bcb85f6) passed **62/62 active Node tests** and **146/146 full historical Node+Chromium script executions**, with zero test failures. The Pages deployment succeeded; no new physical-phone or exact hosted-page interactive smoke was performed. See [Dortmund verification](CLUB_PLAYER_METADATA_DORTMUND_20261016.md) and the third immutable metadata record. The known Daniel Svensson role discrepancy remains open as an explicit future roster-selection batch. Do not repeat completed metadata edits.


## Batch 4 — Napoli metadata checkpoint (CLUB-20261016-NAP-METADATA-1)

The [Napoli player metadata report](CLUB_PLAYER_METADATA_NAPOLI_20261016.md) and `docs/PLAYER_METADATA_BATCHES_20261016.json` capture 49 sourced metadata corrections on 12 Napoli players, using 2026/27 Napoli/UEFA registration and individual physical data. All 165-club name/role/rating history and gameplay code remain unchanged. Test: `tests/napoli_player_metadata_20261016.test.cjs`. Conflict notes: Buongiorno appears in Napoli's club squad but not its 2 September UEFA League Phase list, and Rrahmani, Lobotka and Politano have source-specific height differences. Mark batch complete only after checking CI and Pages statuses. Next five: Brighton registration, Dortmund position, Everton metadata, Inter metadata, remaining Club26-to-continental audit.

## Verified Napoli batch checkpoint (2026-10-16)

Batch `CLUB-20261016-NAP-METADATA-1` is **regression verified**, with [source commit 8614494](https://github.com/saeedsai/SuperMagicFootball/commit/8614494aff7ae56b579ab52145997df45f3fe434). [Active modular QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38884726493) passed **67/67 Node tests** and the [full regression census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38884726513) passed **150/150 executable scripts** (98 Node, 52 Chromium), zero failures/timeouts/errors. [GitHub Pages deployment](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38884724808) succeeded. The Pages URL is published but a fresh direct PC/physical-mobile interactive test on this exact version was **not** independently completed. Documentation-only certification does not modify any player data or gameplay. See [Napoli correction and QA report](CLUB_PLAYER_METADATA_NAPOLI_20261016.md).

Scope reminder: 32 Club26 teams currently have **93 wrong populated ages, 197 missing ages, 346 missing heights, 13 old Holland labels** after this batch. Continue the separate unresolved Brighton and Dortmund role/club-selection issues only with a role-balanced immutable selection change log. Future metadata batches: Everton, Inter, remaining Club26, then continental clubs. Avoid cleanup that removes files referenced by live regressions or other agents.

## Batch 5 — Everton age/height metadata (CLUB-20261016-EVE-METADATA-1)

**Owned scope:** `roster-club-club26_27`, `roster-everton-20261016-gpt6-session5`, starting `dac2b5b788d4172f4ccc787c57c97e881ee2d67d`. The [Everton handover](CLUB_PLAYER_METADATA_EVERTON_20261016.md) records **12 DOB-consistent ages and 10 measured heights** (22 fields) on 12 unchanged IDs. No new OVR, team, roster selection, position, gameplay attributes or 2026/27 shirt-number changes were made: stale Beto/Iliman registration and Garner/Mykolenko position anomalies require a separate selection batch. New dedicated regression: `tests/everton_player_metadata_20261016.test.cjs`. The official Premier League list and Reuters confirm existing roster issues; preserve all previous four metadata batches and current 165-club immutable selected-player ledger. After CI completion update status/results, release claim, then move to the five next tasks listed in the handover.

## Everton checkpoint: 22 corrections, 82/82 active QA (2026-10-16)

Source [dc9f46e](https://github.com/saeedsai/SuperMagicFootball/commit/dc9f46e16afa924ed19772bcd4b9c4bc464127e5) fixed 12 ages and filled 10 heights, retaining all immutable club selections, roles and FC27 gameplay ratings. [Integrated modular QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891827540) passed **82/82 active Node tests**, including the new Everton test and the full 165-club roster audit. [GitHub Pages](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891826819) succeeded on an integrated revision. **Full historical Node/Chromium census on exact player source revision did NOT finish** because concurrent pushes cancelled it; the later run was still queued. See [Everton QA handover](CLUB_PLAYER_METADATA_EVERTON_20261016.md), and never claim hosted physical-phone testing was done. New Club26 backlog: 86 wrong ages, 192 missing ages, 336 missing heights; source-ranked club transfers, positions, and official shirts remain a separately claimable requirement. Release the Everton lock at checkpoint so another agent may select an unowned club or new Everton selection batch.

## Batch 6 — Inter Milan small sourced metadata checkpoint (CLUB-20261016-INT-METADATA-1)

[Inter metadata handover](CLUB_PLAYER_METADATA_INTER_20261016.md): five players' official age and centimetre height verified directly on Inter.it; 10 field-level edits tracked in `PLAYER_METADATA_BATCHES_20261016.json`. Player selection, shirt numbers, ratings and game attributes unchanged. Exclusive `roster-club-club26_8` claim acquired before edit; release after test/report. Test `tests/inter_player_metadata_20261016.test.cjs`. Remaining Inter keeper/registration and shirt-number issues require separate review. Next five are recorded in handover.

## 2026-10-16 — Arsenal official EA FC 27 launch rating + 2026/27 physical metadata checkpoint

- Owner: `roster-arsenal-20261016-gpt6-session1`; exclusive lock: `roster-club-club26_0`. Corrected eight jerseys and eight missing ages; recorded 12 sourced centimetre heights and official EA rating links, with 12/12 OVR and 72/72 face stats already matching. No OVR, role, gameplay stat or other-club edits.
- Immutable per-field batch: `CLUB-20261016-ARS-FC27-VERIFICATION-1` in `PLAYER_METADATA_BATCHES_20261016.json`; handover: [Arsenal official 2026/27 FC27 metadata](CLUB_PLAYER_METADATA_ARSENAL_20261016.md). Continue from latest dev after claim release; do not repeat Arsenal unless resolving specifically documented conflicts.
- Next five bounded candidates: Bayern `club26_1`, Manchester City `club26_2`, PSG `club26_3`, Barcelona `club26_4`, Manchester United `club26_5`; check active claims and team handovers before selection. Official EA team page first, club/league registration for number and age, reputable physical sources for height.

## 2026-10-16 — Bayern Munich FC 27 official launch verification and player metadata

- Exclusive `roster-club-club26_1` lock; 12 of 12 game OVR and 72 of 72 six-face-attribute entries already match [EA's official Bayern FC 27 table](https://www.ea.com/nb/games/ea-sports-fc/ratings/teams-ratings/fc-bayern-munchen/21). **No** rating, team selection, role or arcade gameplay numbers changed.
- Corrected Bayern's **three outdated shirt numbers**, verified DFB 2026/27 birth dates and shirts, filled three ages and all 12 physical heights. Linked updated `ratingSource` and `source` to EA's official launch base-card table. Immutable 12-player per-field batch `CLUB-20261016-FCB-FC27-VERIFICATION-1` in `PLAYER_METADATA_BATCHES_20261016.json`.
- Dedicated [Bayern metadata/source checkpoint](CLUB_PLAYER_METADATA_BAYERN_20261016.md) with reproducible test `tests/bayern_fc27_official_20261016.test.cjs`. CI/Pages results require checking exact source SHA and separate hosted PC/touch test. Future 5 individual club batches: City `club26_2`, PSG `club26_3`, Barcelona `club26_4`, Manchester United `club26_5`, Madrid `club26_7`. Check live locks before working.

## 2026-10-16 — Manchester City FC 27 official rating and physical metadata verification

- Claimed isolated `roster-club-club26_2` batch, [official EA City player cards](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/manchester-city/10) confirm all **12 OVR and 72 headline values** exactly match already-loaded database: no number edits required.
- [Premier League 2026/27 number list](https://www.premierleague.com/en/news/4725682/all-20-premier-league-clubs-squad-numbers-for-202627-season) confirms **five corrected numbers and five verified shirts**. The [2026/27 physical biography](https://footballsquads.co.uk/eng/2026-2027/engprem/mancity.htm) supplies **five missing DOB-based ages** and **12 player heights**; no custom gameplay attributes, IDs, roles, other clubs or runtime logic changed.
- Immutable batch: `CLUB-20261016-MCI-FC27-VERIFICATION-1` in `PLAYER_METADATA_BATCHES_20261016.json`; complete [City handover](CLUB_PLAYER_METADATA_MAN_CITY_20261016.md) and dedicated `tests/man_city_fc27_official_20261016.test.cjs`. Verify exact-SHA CI/deployment after pushing. Future separately claimed clubs: PSG `club26_3`, Barcelona `club26_4`, Manchester United `club26_5`, Real Madrid `club26_7`, Tottenham `club26_29`.
