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
