# Napoli 2026/27 — player metadata batch and checkpoint

**Batch:** `CLUB-20261016-NAP-METADATA-1` · **Verified reference date:** 2026-10-16 · **Baseline dev commit:** `5f722745886040ea19e87f79afe974a7a132d55e`.

## Changes strictly limited to player information

- Fixed the twelve existing Napoli squad entries in `data/players/club26.json` and its byte-for-byte corresponding team in `src/roster_corrections.js`: **49 metadata corrections** across **12 players** (12 ages, 12 shirt numbers, 12 heights in centimetres, 12 shirt-verification flags, 1 nationality normalization).
- Sources: [SSC Napoli UEFA List A as registered 2 September 2026](https://sscnapoli.it/en/napoli-la-lista-uefa-per-la-league-phase-di-champions-league-2/); [UEFA Champions League 2026/27 Napoli squad](https://www.uefa.com/uefachampionsleague/clubs/50136/squad/); [Napoli club first team](https://sscnapoli.it/en/team-2025-2026/); [StatMuse 2026/27 individual physical data table](https://www.statmuse.com/fc/club/2026-27-napoli-268/roster/2027); individual UEFA player pages in the field-level [ledger](docs/PLAYER_METADATA_BATCHES_20261016.json).
- Age is computed from ISO date of birth at 2026-10-16; never copy StatMuse's forward-dated displayed ages without adjusting for birthdays.
- Kept exactly **2 GK, 3 DF, 4 MF, 3 FW**. Every player ID, name, club allocation, positional role, OVR, underlying unofficial FC27 face stats, tactical data, engine/UI/control code and previous 165-club selection audit remained unchanged.
- Created the permanent before/after source audit `docs/PLAYER_METADATA_BATCHES_20261016.json` with batch `CLUB-20261016-NAP-METADATA-1`; the two earlier verified metadata batch records and Aston Villa batch are left unchanged.
- New targeted regression `tests/napoli_player_metadata_20261016.test.cjs` verifies all Napoli shirt numbers, heights, ages, role quotas, 12 stable player IDs, rating history, provenance and JSON/runtime parity.

## Known gaps requiring later batches

1. **Napoli UEFA List A difference** (Alessandro Buongiorno): Included in Napoli club first-team page but absent from the 2 September 2026 UEFA Champions League League Phase list. Do not infer a transfer: competitions can have different registration. No roster-selection or overall edit until reconciling league registration.
2. **height disagreement** (Amir Rrahmani): UEFA personal page states 192 cm while StatMuse 2026/27 lists 190 cm. Selected 192 cm from primary UEFA page.
3. **height disagreement** (Stanislav Lobotka): UEFA says 170 cm; StatMuse says 171 cm. Selected 170 cm from UEFA.
4. **height disagreement** (Matteo Politano): UEFA says 171 cm; StatMuse says 169 cm. Selected 171 cm from UEFA.
5. **FC27 ratings/face attributes**: Unofficial third-party FC27 values remain unverified and unchanged; real match performance statistics cannot be directly converted to EA/FC27 face-stat ratings.

## CI and deployment gate

Pending at authoring: `python3 scripts/validate_data.py`, `node tests/all_club_fc27_rosters.mjs`, `node tests/club_roster_batch_ledger.mjs`, active Node + historical Node/Chromium suite, GitHub Pages publication. Report exact run IDs and results before changing the batch status from `pending_ci_regression`. A successful Pages action does not independently establish a touch-screen/physical-device smoke on that exact revision.

## Next five isolated iterations

1. Brighton transfer/shortlist: source-check Carlos Baleba's 2026/27 registration and document a role-balanced real replacement with immutable name/OVR selection history.
2. Dortmund roles: investigate Daniel Svensson listed as FW despite his primary registered DF role; select role-appropriate real forwards only with confirmed ratings.
3. Everton: correct age, height, nationality and current squad number values on the existing 12 slots, 2026/27 official registration first.
4. Inter Milan: source-backed age, shirt and height corrections without guessed EA-style gameplay attributes.
5. Remaining Club26 age checkpoint, then expand to continental clubs, tracking only untouched players by team and immutable batch ID.

**Concurrency rule:** always fetch latest dev HEAD before writing, rebase only non-overlapping files and use expected SHA on `update_ref`. Do not delete old docs, tests, assets or templates unless confirmed unused by both build and other agents.
