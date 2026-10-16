# Everton player data — bounded 2026-10-16 metadata checkpoint

**Feature** `CLUB26-EVERTON-METADATA-20261016` · **Exclusive lock** `roster-club-club26_27` · **Owner** `roster-everton-20261016-gpt6-session5` · **Base dev SHA** `dac2b5b788d4172f4ccc787c57c97e881ee2d67d` · **Batch** `CLUB-20261016-EVE-METADATA-1`.

## Changes

Verified 12 existing player birth dates and corrected their ages as of **16 October 2026**; filled 10 height measurements explicitly supported by the consulted sources, **22 total field changes** across the current 12 Everton game slots. Two measured heights (Hayden Hackney and Brennan Johnson) remain unset rather than guessed.

Source evidence: [FA Jordan Pickford identity and 185 cm](https://www.englandfootball.com/england/mens-senior-team/squad/Jordan-Pickford), [Premier League Jarrad Branthwaite 195 cm](https://www.premierleague.com/players/66318/player/overview), [StatMuse detailed 2026/27 Everton player roster](https://www.statmuse.com/fc/club/2026-27-everton-49/roster/2027), [Beto third-party biography height only](https://www.transfermarkt.co.uk/beto/profil/spieler/595809). Before-and-after values and each field's evidence URL are in [metadata ledger](PLAYER_METADATA_BATCHES_20261016.json).

The squad as stored in the game has historic player selection/club registration errors and role assignments; this is an **age/height-only** batch. We deliberately did not change game club membership, names, roles, original jersey numbers, ratings, 2026/27 FC27 data provenance or pace/power/shoot/defence attributes. Role quotas 2GK/3DF/4MF/3FW, all original team IDs/player IDs, prior metadata batch audit and the 1,980-player selection ledger are unchanged. The only runtime code path changed is the literal Everton player metadata in `src/roster_corrections.js`.

## Open player selection and current registration gaps

1. **Beto:** [Reuters, 1 September 2026](https://www.reuters.com/sports/soccer/everton-striker-beto-completes-move-fiorentina-2026-09-01/) reports a permanent transfer from Everton to Fiorentina. His game slot remains pending a separate sourced real-player replacement and the immutable name/role/OVR audit.
2. **Iliman Ndiaye:** absent from the [official current Everton Premier League list](https://www.premierleague.com/en/clubs/11/news/squad); destination not independently confirmed here, so do not assert his new club.
3. **Roles:** James Garner is a MF rather than the current game DF; Vitaliy Mykolenko is a DF rather than the current game MF according to [Premier League squad positions](https://www.premierleague.com/en/clubs/11/news/squad). Roles are not silently swapped while the selection audit is immutable.
4. **Shirts:** official [22 September 2026 Premier League jersey numbers](https://www.premierleague.com/en/news/4725682/all-20-premier-league-clubs-squad-numbers-for-202627-season) differ from the game. The game uses historical unique 1–12 slots, and assigning correct numbers only to the 10 still-listed players would conflict with stale Beto/Ndiaye slots. Resolve player selection and shirts atomically in a separate fully audited batch.
5. **Ratings and gameplay face attributes:** existing unofficial FC27 data is not sufficient evidence for overwriting OVR, pace, shooting, passing, etc.; these are not modified.
6. **Heights:** no exact source measurement for Hayden Hackney or Brennan Johnson in the reviewed detailed roster; leave empty for future targeted primary-source verification.

## Test and release plan

- Targeted Node acceptance: `node --test tests/everton_player_metadata_20261016.test.cjs`; 165-club identity/role/OVR source audit; player-data validator; full historical Node and Chromium CI; Pages deployment and hosted desktop/touch smoke if actually available.
- No deletion of old fixture, template or source files: the repository's other actively owned code and historic QA reference them. Folder cleanup is deferred to an owner with verified safe references.
- Source and runtime player record parity, original 12-shirt snapshot and immutability of rating/roles explicitly covered by new test.

## Next five small batches

1. Brighton — Beto-unrelated Carlos Baleba transfer and official current role-balanced selection/ratings audit (under its own club lock).
2. Dortmund — Daniel Svensson defender/forward mismatch; separately source an eligible current forward.
3. Everton — Beto/Iliman latest club, player shortlist and official 2026/27 shirts (new claim under same club key after release).
4. Inter Milan — untouched team metadata from official 2026/27 roster, source-backed physical and age fields.
5. Remaining Club26, then continental 133 teams — claim one new team each time; no speculative FC27 overall, attribute or transfer data.

**Handover:** recheck `AGENTS.md`, [coordination rules](agent_coordination/README.md), the [feature claim](agent_coordination/claims/roster-club-club26_27.json), the immutable squad-change ledger, this handover and the new focused test. Full CI and Pages are reported as their actual status after push. Release claim with this link and final source commit.


## Actual CI evidence and final bounded handover

- **Committed player-data source:** [dc9f46e](https://github.com/saeedsai/SuperMagicFootball/commit/dc9f46e16afa924ed19772bcd4b9c4bc464127e5). Only six roster-related files changed; Everton's `club26_27` data mirrored byte-for-byte into the runtime roster JSON. No changes to mechanics, other clubs, roles, overall ratings or FC27 gameplay face stats.
- **Data validation and full-club immutable roster audit: PASS.** All 165 clubs, all 1,980 slots, and every 2GK/3DF/4MF/3FW quota passed [latest integrated modular QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891827540).
- **Focused Everton player acceptance: PASS**, same integrated run. **82 active Node tests PASS / 0 FAIL** on integrated commit `709eeec`; the four earlier Aston Villa, Brighton, Dortmund and Napoli regressions remain in the active suite.
- **Source-revision QA caveat:** [initial run](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891568735) reported 81 pass / 1 fail, caused by another agent's negative-path Python QA-framework fixture. That test was repaired under the **separate QA ownership claim** and the latest integrated 82/82 Node test suite passed. No keeper, QA runner, CI or graphics changes were made in this Everton batch.
- **Full historical Node/Chromium regression: NOT CERTIFIED for source revision.** [Original full census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891568706) was cancelled by overlapping pushes; [later full census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891827523) was queued at checkpoint. Do not claim a completed full regression solely from the 82 passing active tests.
- **Pages deployment: SUCCESS** on a newer integrated `dev` revision: [Pages Actions](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891826819), [published public game](https://saeedsai.github.io/SuperMagicFootball/). Direct interactive hosted PC and phone test for the exact Everton source revision is **not independently verified**; the host URL is not accessible to the web viewer in this conversation.
- **Remaining Club26 metadata snapshot (32 clubs, 384 slots):** 86 inconsistent populated ages, 192 missing ages, 336 missing heights and 13 legacy "Holland" nationality labels.
- **Claim handover:** `docs/agent_coordination/claims/roster-club-club26_27.json` is released in the final checkpoint so the next agent can make a *new* exclusive claim. Before touching Everton again, inspect `AGENTS.md`, feature registry and all active claims; review this report, the 22 immutable field-level changes and `tests/everton_player_metadata_20261016.test.cjs`, then claim a **different explicit Everton requirement** (club/role/shirt/OVR selection) under the same key. No player-data rework or historic cleanup without verification.
