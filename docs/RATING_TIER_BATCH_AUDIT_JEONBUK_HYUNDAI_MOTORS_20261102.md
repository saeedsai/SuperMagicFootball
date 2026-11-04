# Rating-tier source batch audit: Jeonbuk Hyundai Motors (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_afc_20` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each stable FC 27 source ID was checked against its official EA SPORTS individual ratings page and the official [Jeonbuk Hyundai team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/jeonbuk-hyundai/1477). EA displays the team name as “Jeonbuk Hyundai.” All twelve ledger identities and source IDs appear on the official team list and their individual pages identify them as Jeonbuk Hyundai players. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute values are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. “—” means no direct same-name EA leaf for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Song Bum Keun | GK → GK | 238570 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/song-bum-keun/238570) | `gkDiving` 76; `agility` 31; `strength` 40; `stamina` 22 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Lee Joo Hyun | GK → GK | 255239 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lee-joo-hyun/255239) | `gkDiving` 63; `agility` 34; `strength` 61; `stamina` 21 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Cho Wi Je | DF → CB | 267401 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/cho-wi-je/267401) | `strength` 90; `aggression` 70; `stamina` 86 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Kim Young Bin | DF → CB | 222582 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kim-young-bin/222582) | `strength` 86; `aggression` 67; `stamina` 67 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Park Ji Soo | DF → CB | 212912 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/park-ji-soo/212912) | `strength` 78; `aggression` 68; `stamina` 72 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Kim Jin Gyu | MF → CM | 227659 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kim-jin-gyu/227659) | `crossing` 65; `dribbling` 71 (leaf); `agility` 85; `stamina` 86 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Kang Sang Yoon | MF → CM | 268895 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kang-sang-yoon/268895) | `crossing` 60; `dribbling` 70 (leaf); `agility` 79; `stamina` 90 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lee Dong Jun | MF → RM | 243061 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lee-dong-jun/243061) | `crossing` 61; `dribbling` 70 (leaf); `agility` 91; `stamina` 67 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Kim Seung Sub | MF → LM | 242821 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kim-seung-sub/242821) | `crossing` 58; `dribbling` 68 (leaf); `agility` 80; `stamina` 77 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lee Seung Woo | FW → LW | 232000 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lee-seung-woo/232000) | `shootPower` 69; `dribbling` 74 (leaf); `agility` 82 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Andrea Compagno | FW → ST | 262447 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/andrea-compagno/262447) | `shootPower` 71; `dribbling` 62 (leaf); `agility` 40 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Bruno Mota | FW → ST | 272992 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bruno-mota/272992) | `shootPower` 70; `dribbling` 57 (leaf); `agility` 63 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

All twelve EA primary positions fit the ledger's broad GK, DF, MF, or FW category. No broad-position discrepancy was found. EA's team name is “Jeonbuk Hyundai” while the game ledger uses “Jeonbuk Hyundai Motors”; this is an observed naming difference, not an identity or player-ID substitution. All twelve source IDs align with the individual pages and the listed player names.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and other EA category summaries are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_afc_20` ledger rows and twelve distinct FC 27 source IDs; all twelve identities appear on EA's Jeonbuk Hyundai team list.
- Position accounting: 12 broad-position matches and no player-position discrepancy.
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
