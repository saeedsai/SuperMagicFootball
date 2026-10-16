# Arsenal — Official FC 27 ratings and 2026/27 player metadata (16 October 2026)

**Owner/claim:** `roster-arsenal-20261016-gpt6-session1` / `roster-club-club26_0`
**Feature:** `CLUB26-ARSENAL-FC27-OFFICIAL-METADATA-20261016-B1`
**Immutable metadata batch:** `CLUB-20261016-ARS-FC27-VERIFICATION-1`

## Delivered

- Verified **all 12 Arsenal player overall ratings and all 72 FC 27 headline (PAC/SHO/PAS/DRI/DEF/PHY) values** against the [official EA Arsenal launch ratings table](https://www.ea.com/sv/games/ea-sports-fc/ratings/teams-ratings/arsenal/1). No OVR or headline attribute adjustment was required, because values matched exactly.
- Cross-checked **12/12 team memberships and shirt numbers** against the [Premier League 2026/27 squad-number register, dated 22 September 2026](https://www.premierleague.com/en/news/4725682/all-20-premier-league-clubs-squad-numbers-for-202627-season).
- Corrected **8 old shirt numbers** and turned on the eight corresponding verified shirt flags; populated **8 previously missing ages** from listed birth dates at reference date **2026-10-16** and **12 centimetre heights** from [2026/27 squad biographies](https://www.footballsquads.co.uk/eng/2026-2027/engprem/arsenal.htm), with Premier League profile preference for [David Raya](https://www.premierleague.com/players/7975/David-Raya-Martin/overview) and [William Saliba](https://www.premierleague.com/players/66204/stats).
- Replaced the 12 unofficial `ratingSource`/rating links with EA's own FC 27 table and recorded individual verification dates. The original third-party `sourceSnapshot` date remains as historical metadata. These fields document that we verified EA's *launch Ultimate Team base-card* values, not live-form updates.
- Source `data/players/club26.json` and runtime `src/roster_corrections.js` remain byte-for-byte equivalent as structured player records. Retained all 12 player IDs, roles, names, OVR, arcade power/shoot/defense/speed and all other teams. No UI/gameplay/graphics/CI edits.

## Current verified snapshot

| Player | Game role | FC 27 OVR | Shirt | Age (Oct 16) | Height cm |
| --- | --- | ---: | ---: | ---: | ---: |
| David Raya | GK | 88 | 1 | 31 | 183 |
| Kepa | GK | 78 | 13 | 32 | 189 |
| Gabriel | DF | 89 | 6 | 28 | 190 |
| William Saliba | DF | 88 | 2 | 25 | 192 |
| Ezri Konsa | DF | 84 | 15 | 28 | 183 |
| Declan Rice | MF | 88 | 41 | 27 | 185 |
| Bruno Guimarães | MF | 86 | 39 | 28 | 182 |
| Martin Ødegaard | MF | 86 | 8 | 27 | 176 |
| Zubimendi | MF | 84 | 36 | 27 | 180 |
| Bukayo Saka | FW | 87 | 7 | 25 | 178 |
| Viktor Gyökeres | FW | 86 | 14 | 28 | 187 |
| Eberechi Eze | FW | 84 | 10 | 28 | 173 |

## Important limitations and residual gaps

1. EA FC 27's six headline face values are not directly interchangeable with SuperMagic Football's custom `power/shoot/defense/speed` gameplay tuning. Those gameplay values and `statsVerified: false` are **unchanged**; the game's role quotas are also unchanged (Eberechi Eze has an EA CAM card, but a constrained game FW slot).
2. Height data disagree between otherwise credible sources: **David Raya 183 cm** (Premier League) versus **186 cm** (FIFA World Cup 2026 registration); **William Saliba 192 cm** (Premier League) versus 193 cm (FootballSquads); **Kepa 189 cm** (FootballSquads) versus 188 cm (Transfermarkt). The recorded heights follow the specified source priority; not all heights are universally authoritative.
3. The selected 12 are a game roster, *not* an entire real-world Arsenal 25-man squad. EA page labels launch-card ratings; it is not evidence about playing time, starting XI, or performance levels.
4. Cross-device live Pages testing is distinct from CI success. Report actual CI workflow results and the hosted site separately before calling deployment verified.

## Verification / next checkpoint

Run `node --test tests/arsenal_fc27_official_20261016.test.cjs`, `python3 scripts/validate_data.py`, `node tests/all_club_fc27_rosters.mjs`, `node tests/club_roster_batch_ledger.mjs`, `python3 scripts/build.py`, `node --test tests/*.test.cjs`, and GitHub's full Node+Chromium regression census. If CI fails, inspect individual job output and maintain the exact commit/claim handover before retry. Never modify other clubs for this feature.

Next five isolated target clubs after this checkpoint: `club26_1` Bayern (FC 27 official comparison and physical metadata); `club26_2` Man City; `club26_3` PSG; `club26_4` Barcelona; `club26_5` Man United. Each requires a new exclusive per-club claim and contemporary sources; no other agents' active club claims may be overwritten.
