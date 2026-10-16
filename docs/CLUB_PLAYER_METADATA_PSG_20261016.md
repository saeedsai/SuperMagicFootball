# Paris Saint-Germain — official FC27 and 2026/27 verified current squad

**Date:** 2026-10-16 | **Club:** `club26_3` | **Owner:** `roster-fc27-chat-20261016-psg-b1` | **Lock:** `roster-club-club26_3`

**Batches:** `CLUB-20261016-PSG-TRANSFER-1` (one changed player), `CLUB-20261016-PSG-FC27-VERIFICATION-1` (67 field-level metadata/provenance edits).

## Verified PSG squad update

- [Official PSG 2026/27 roster](https://www.psg.fr/en/mens-football/squad/season/2026-2027) confirms the 12 selected players below, **except the old slot-9 Bradley Barcola**. Barcola joined Liverpool in August 2026, corroborated by [Reuters](https://www.reuters.com/sports/soccer/liverpool-bring-marquee-forward-signing-barcola-psg-2026-08-31/) and the [2026/27 Ligue 1  biography](https://footballsquads.co.uk/france/2026-2027/ligue1/psg.htm); his 2026/27 PSG squad spot is now **Warren Zaïre-Emery** (CM, jersey **33**).
- Replaced **Bradley Barcola, MF, FC27 OVR 85** with **Warren Zaïre-Emery, MF, official FC27 OVR 83**, with EA [individual player record](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/warren-zaire-emery/270673): 79 PAC, 71 SHO, 78 PAS, 81 DRI, 79 DEF, 85 PHY. The persistent **slot game ID `club26_3_audit_15` is preserved**, as are formation quota and arcade performance values.
- Independently verified **all 12 current PSG selected players' EA launch OVR** and **all 72 headline face-card values** on [official EA PSG FC 27 team ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/paris-sg/73). The remaining 11 OVR/face arrays already matched; updated the replaced midfielder's score and attributes.
- Checked PSG 2026/27 player registration and shirt numbers against [PSG's official squad](https://www.psg.fr/en/mens-football/squad/season/2026-2027); corrected Nuno Mendes **1→25**, Willian Pacho **2→51**, Achraf Hakimi **3→2**, and the now-replaced ninth slot **4→33**. Confirmed all other shirt numbers.
- Verified player names, nationalities, DOB and **12 heights in centimetres** against [2026/27 FootballSquads PSG](https://footballsquads.co.uk/france/2026-2027/ligue1/psg.htm), and calculated age on 2026-10-16 (Pacho turns **25 today**). Original `sourceSnapshot` retained; 12 updated `ratingSource` references now point to EA.
- Kept non-PSG records, all gameplay modules, artwork, UI, CI workflows, IDs, squad role counts, arcade `power` / `shoot` / `defense` / `speed`, custom shooting skill, economy `value` and save schema unchanged.

## Updated squad (12 players)

| PSG player | Game role | EA FC27 OVR | PSG jersey | Age on 16 Oct | Height cm |
| --- | --- | ---: | ---: | ---: | ---: |
| Matvey Safonov | GK | 83 | 39 | 27 | 192 |
| Lucas Chevalier | GK | 80 | 30 | 24 | 192 |
| Nuno Mendes | DF | 89 | 25 | 24 | 184 |
| Willian Pacho | DF | 89 | 51 | 25 | 186 |
| Achraf Hakimi | DF | 88 | 2 | 27 | 180 |
| Vitinha | MF | 90 | 17 | 26 | 172 |
| João Neves | MF | 88 | 87 | 22 | 174 |
| Fabián Ruiz | MF | 86 | 8 | 30 | 189 |
| Warren Zaïre-Emery | MF | 83 | 33 | 20 | 178 |
| Ousmane Dembélé | FW | 90 | 10 | 29 | 178 |
| Khvicha Kvaratskhelia | FW | 89 | 7 | 25 | 183 |
| Désiré Doué | FW | 86 | 14 | 21 | 177 |

## Known caveats and follow-ups

- **EA launch affiliation lag:** EA's published launch PSG FC27 table still contains Barcola, although the official 2026/27 club squad does not. The live club roster takes priority for team membership; EA launch values are used strictly for the selected player ratings. The [Liverpool squad](https://github.com/saeedsai/SuperMagicFootball/blob/dev/data/players/club26.json) is not edited here.
- The strict **2 GK / 3 DF / 4 MF / 3 FW** in-game shape means formation classification is not necessarily the exact official player-card position (e.g. Kvaratskhelia is LW, Doué RW), no changes to gameplay tactics are made.
- FootballSquads heights are one consistently cited 2026/27 reference; measurements can vary across publishers. FC27 base launch cards are not live-form ratings or special items.
- This batch changes only PSG roster/metadata and corresponding audit and dedicated tests. **No cleanup of unrelated files** is safe under this club lock while other agents are working.
- Exact Node/Chromium tests and Pages deployment status should be recorded after source commit. A successful Pages workflow does not independently verify a physical phone or desktop interactive match.

## Tests and deployment checkpoint

Dedicated `tests/psg_fc27_official_20261016.test.cjs` covers 12 official EA OVR and 72 face stats, team assignment, source/runtime parity, 12 DOB/height/ages, shirts, and two immutable ledgers. Run `python3 scripts/advance_club_roster_batch.py --check`, `python3 scripts/validate_data.py`, `node tests/all_club_fc27_rosters.mjs`, `node tests/club_roster_batch_ledger.mjs`, `node --test tests/*.test.cjs`, build, full historical Chromium regression. Record exact source SHA and issues without claiming unrun device checks.

**Next five one-team batches**, subject to fresh ownership: Barcelona `club26_4`, Manchester United `club26_5`, Real Madrid `club26_7`, Liverpool `club26_9` (verify Barcola transfer and EA affiliation), Tottenham `club26_29`.

## Bounded primary-club provenance follow-up

An additional immutable batch `CLUB-20261016-PSG-CLUB-PROVENANCE-2` links PSG's own [2026/27 squad register](https://www.psg.fr/en/mens-football/squad/season/2026-2027) directly to Warren Zaïre-Emery's player record as `clubOfficialSource` and `clubOfficialCheckedAt`. These **two strictly PSG-only provenance fields** preserve all player IDs, EA ratings, custom arcade stats and non-PSG data; test cases assert both fields. This follow-up also triggers the Full Regression Census on the corrected post-ledger-compatible source SHA; record that workflow's result before claiming all-green.

## Verified GitHub CI — post-fix exact source

- **Source integration:** `a6c5d8649fb1b4d2e8ec8f9e70c607abc50de866`, original PSG 12-player data and immutable swap; first [Modular QA #38924193874](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38924193874) failed only because the legacy roster-ledger validator rejects a new provenance enum. This was resolved in `53719fa195374368d4b704888877afe2bf58b126` without relaxing the validator, preserving the old enum plus independent direct EA source verification.
- **Final data-source SHA**: [`3f5cf46`](https://github.com/saeedsai/SuperMagicFootball/commit/3f5cf46c6732a84955a9178a0b1988a34adf804c), adds `clubOfficialSource` and source-check date to Warren's record (also in the runtime) as a separate immutable 2-field batch. Other clubs and game code remain unchanged.
- [Modular Game Dev QA #38925059044](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38925059044): **SUCCESS**, **174/174 active Node tests**, 3/3 PSG targeted tests, 165 clubs / 1,980 slots, 208 recorded historical replacements, exact source/runtime matching and audit SHA PASS.
- [Pages build/deploy #38925057855](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38925057855): **SUCCESS** (build, report and deploy all passed) for exact source `3f5cf46`. Public game URL: https://saeedsai.github.io/SuperMagicFootball/. Direct hosted URL fetch failed from this execution environment (DNS/network inaccessible); independent phone and desktop gameplay **NOT TESTED**.
- [Full Regression Census #38925059080](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38925059080): exact source SHA `3f5cf46`, preflight success, historical **131/131 Node script checks passed** (33+33+33+32); four browser/Chromium shards still running at the time of this checkpoint. **Do not count browser as passed until all finish.**
- The previous census [#38924194044](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38924194044), run on the original failing ledger snapshot, failed one historic Node script due to the same superseded provenance enum. The later full census above is the authoritative corrected-source regression.

**Batch boundary:** Do not refactor game or delete older historical files under a roster-club lock. Only targeted PSG source data, corresponding runtime player records, roster audit/ledger, dedicated test and own specialist handover/memory were touched.
