# Rating-tier source batch audit: Daejeon Hana Citizen (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_afc_21` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each stable FC 27 source ID was checked against its official EA SPORTS individual ratings page and the official [Daejeon Hana team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/daejeon-hana/980). All twelve EA individual pages resolve to the listed same-name player and identify Daejeon Hana; all twelve names are present on the official team list. The EA team label is “Daejeon Hana”; the game ledger label is “Daejeon Hana Citizen.” No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Shooting, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages reflect launch Gold, Silver, and Bronze Ultimate Team player items, exclude other item types and later live-form updates in other modes, and note that club affiliations can change. Values below are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger broad position followed by EA's primary position. Positions outside the existing broad role grouping are recorded as discrepancies without changing or normalizing game positions. “—” means no direct same-name EA leaf for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Lee Chang Geun | GK → GK | 210941 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lee-chang-geun/210941) | `gkDiving` 74; `agility` 64; `strength` 60; `stamina` 22 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Lee Kyung Tae | GK → GK | 259255 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lee-kyung-tae/259255) | `gkDiving` 57; `agility` 29; `strength` 71; `stamina` 18 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Kim Bong Soo | DF → CM **(discrepancy)** | 260474 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kim-bong-soo/260474) | `strength` 78; `aggression` 70; `stamina` 87 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Kim Moon Hwan | DF → RB | 244800 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kim-moon-hwan/244800) | `strength` 60; `aggression` 63; `stamina` 87 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Gustav Ludwigson | DF → LM **(discrepancy)** | 256370 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gustav-ludwigson/256370) | `strength` 77; `aggression` 75; `stamina` 84 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Lee Myung Jae | MF → LB **(discrepancy)** | 222052 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lee-myung-jae/222052) | `crossing` 66; `dribbling` 69 (leaf); `agility` 84; `stamina` 78 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Bobsin | MF → CM | 263787 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bobsin/263787) | `crossing` 53; `dribbling` 68 (leaf); `agility` 68; `stamina` 83 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Jeong Jae Hee | MF → RM | 234276 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jeong-jae-hee/234276) | `crossing` 63; `dribbling` 66 (leaf); `agility` 79; `stamina` 74 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| João Victor | MF → RM | 258358 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joao-victor/258358) | `crossing` 59; `dribbling` 69 (leaf); `agility` 76; `stamina` 47 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Joo Min Kyu | FW → ST | 213189 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joo-min-kyu/213189) | `shootPower` 75; `dribbling` 64 (leaf); `agility` 64 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Kim Hyeon Ug | FW → RW | 237091 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kim-hyeon-ug/237091) | `shootPower` 72; `dribbling` 69 (leaf); `agility` 77 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Diogo Oliveira | FW → ST | 255686 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/diogo-oliveira/255686) | `shootPower` 72; `dribbling` 64 (leaf); `agility` 79 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Three EA primary positions fall outside the ledger's broad role grouping: Kim Bong Soo is stored as `DF` but EA lists `CM`; Gustav Ludwigson is stored as `DF` but EA lists `LM`; and Lee Myung Jae is stored as `MF` but EA lists `LB`. The other nine positions fit their ledger groups, including `MF` with primary `RM` and `FW` with primary `RW`. These are observations only and do not change or normalize roster positions.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and EA category summaries are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_afc_21` ledger rows and twelve distinct FC 27 source IDs; every ledger name and ID resolves on its EA individual page and every name appears on the Daejeon Hana team list.
- Position accounting: 9 broad-position matches and 3 documented discrepancies (Kim Bong Soo, Gustav Ludwigson, Lee Myung Jae).
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
