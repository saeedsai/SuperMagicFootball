# Bayern Munich — FC 27 official OVR and 2026/27 metadata checkpoint

**Date:** 2026-10-16 | **Club ID:** `club26_1` | **Batch:** `CLUB-20261016-FCB-FC27-VERIFICATION-1`
**Owner/lock:** `roster-fc27-chat-20261016-bayern-b1` / `roster-club-club26_1`

## Verified result

- Compared all **12 players' overall ratings and 72 FC 27 headline attributes** to the [official EA FC 27 Bayern rating table](https://www.ea.com/nb/games/ea-sports-fc/ratings/teams-ratings/fc-bayern-munchen/21). **12/12 OVR and 72/72 face stats matched**; no numerical overall / gameplay value changes were necessary.
- Matched 12 current names, roster registration, jersey numbers and existing dates of birth with the [German football federation DFB 2026/27 squad register](https://datencenter.dfb.de/en/competitions/bundesliga/seasons/2026-2027/teams/bayern-munich). Corrected **three jersey numbers** (Konrad Laimer 3→27, Aleksandar Pavlović 5→45, Ismael Saibari 7→34); marked their shirt provenance verified. Filled **three missing age values** based on the DFB birth dates as of 2026-10-16.
- Filled **12 missing heights** using the [2026/27 FootballSquads Bayern biographies](https://footballsquads.co.uk/ger/2026-2027/bundes/bayern.htm), in centimetres. Compared nations against that independent source. Preserved player IDs, team membership, names, all 12 OVR, the existing 2GK/3DF/4MF/3FW lineup role distribution and all gameplay attributes.
- Relabelled 12 historically third-party FC 27 rating sources to directly verified EA official launch-card sources; retained the older `sourceSnapshot` as historical evidence and set `fc27OfficialCheckedAt` for the independent 2026-10-16 verification. `statsVerified` remains false because it concerns arcade game attributes.

## Stored snapshot

| Player | Game role | FC 27 OVR | Jersey | Age on 2026-10-16 | Height cm |
| --- | --- | ---: | ---: | ---: | ---: |
| Manuel Neuer | GK | 81 | 1 | 40 | 192 |
| Jonas Urbig | GK | 79 | 40 | 23 | 189 |
| Joshua Kimmich | DF | 88 | 6 | 31 | 176 |
| Dayot Upamecano | DF | 87 | 2 | 27 | 188 |
| Jonathan Tah | DF | 87 | 4 | 30 | 192 |
| Jamal Musiala | MF | 87 | 10 | 23 | 181 |
| Konrad Laimer | MF | 85 | 27 | 29 | 179 |
| Aleksandar Pavlović | MF | 83 | 45 | 22 | 186 |
| Ismael Saibari | MF | 83 | 34 | 25 | 185 |
| Harry Kane | FW | 90 | 9 | 33 | 188 |
| Michael Olise | FW | 90 | 17 | 24 | 184 |
| Luis Díaz | FW | 88 | 14 | 29 | 180 |

## Caveats and unresolved review

1. EA's published ratings page covers Ultimate Team launch base cards, excluding later special or live-form ratings. Official `fc27FaceStats` are not equivalent to SuperMagic's `power`, `shoot`, `defense`, `speed`; the game's tunings are **not changed**.
2. The game's strict 12-player / 2GK–3DF–4MF–3FW structure makes **Joshua Kimmich a DF** (EA CDM card) and **Ismael Saibari a MF** (EA CAM). It is not a promise of real-life preferred position.
3. FootballSquads heights are sourced values, not a claim that all football sources agree on measurements; disputes should be resolved player by player, preserving original provenance.
4. GitHub Pages build and browser workflows do not automatically establish successful physical-phone gameplay. Report hosted PC/touch smoke and physical-device verification separately.

## Exact test and integration checkpoint

Run `python3 scripts/validate_data.py`, `node --test tests/bayern_fc27_official_20261016.test.cjs`, `node tests/all_club_fc27_rosters.mjs`, `node tests/club_roster_batch_ledger.mjs`, `python3 scripts/build.py`, `node --test tests/*.test.cjs` and the full 4×Node/4×Chromium regression census on exact source SHA. Record CI runs, Pages deployment, any inherited failures and claim release after actual results.

**Next five independent per-club targets (check live claims first):** Man City `club26_2`, PSG `club26_3`, Barcelona `club26_4`, Manchester United `club26_5`, Real Madrid `club26_7`. For each: official EA OVR/6 face stats, club/league registration, nationality, birth-date/age, sourced heights, stable IDs, dedicated tests, QA and new immutable metadata batch.

## Actual 16 October 2026 CI checkpoint and integration limits

- **Source/data SHA**: [`6c396a9`](https://github.com/saeedsai/SuperMagicFootball/commit/6c396a98023ec36ddc59caa6453346ebd57c7253) changed only Bayern roster/player records, per-field metadata ledger, handover, own memory and dedicated source test.
- **Strengthened nationality/DOB test SHA**: [`3bc2db2`](https://github.com/saeedsai/SuperMagicFootball/commit/3bc2db27d529b6cd1bad024b4b538698f5feae1f). Its [Modular Game Dev QA run #38904974985](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38904974985) completed **SUCCESS**: 223-team / 2,676-player JSON and roster validation, 165-club quotas and immutable audit PASS; 3 dedicated Bayern tests PASS; **134 active Node tests PASS, 0 FAIL**. The run includes another agent's separately integrated halftime test fix.
- **Earlier source run #38904697279**: validation and club audit passed but 129/130 active Node tests passed; inherited **`halftime_match_lifecycle.test.cjs` failed** because a test's engine-method adjacency assertion was invalid after unrelated concurrent gameplay changes. Later `dev` fixed this outside the Bayern roster scope; do not change shared gameplay engine under a club lock.
- **Full historical Node/Chromium census on exact Bayern source SHA #38904696936**: **CANCELLED** before execution due competing workflow runs. [Later integrated census #38905117786](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38905117786) is a separate later `dev` SHA; check for completion separately, and never claim success before it finishes.
- **GitHub Pages deployment for `6c396a9` (#38904697077) and `3bc2db2` (#38904975262)**: **CANCELLED** in rapidly moving shared `dev`. Newer integration Pages run [#38905118225](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38905118225) is separate and must be verified by outcome. Public URL remains https://saeedsai.github.io/SuperMagicFootball/ ; fresh hosted desktop/phone interactivity and physical-device certification **NOT VERIFIED**.
- **Regression outside roster scope**: previously observed Android rainbow-dribble double tap regression [#3](https://github.com/saeedsai/SuperMagicFootball/issues/3) belongs to input/gameplay. No unrelated game mechanic, rendering, UI or workflow edits are included in the Bayern batch.

**Handover:** Reserve `roster-club-club26_2` for Manchester City after confirming it is unclaimed. Use current `dev`, verify EA FC 27 launch cards, player registrations, shirt/DOB/height sources; avoid repeating Arsenal/Bayern. The immutable batch ID above is the authoritative changed-field checkpoint.
