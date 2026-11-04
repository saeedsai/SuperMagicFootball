# Rating-tier source batch audit: Buriram United (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_afc_23` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each stable FC 27 source ID was checked against its official EA SPORTS individual ratings page and the official [Buriram United team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/buriram-united/112638). All twelve IDs resolve to the listed same-name individuals, and all twelve names appear on the Buriram United team list. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Shooting, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages reflect launch Gold, Silver, and Bronze Ultimate Team player items, exclude other item types and later live-form updates in other modes, and note that club affiliations can change. Values below are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger broad position followed by EA's primary position. Positions outside the existing broad role grouping are recorded as discrepancies without changing or normalizing game positions. “—” means no direct same-name EA leaf for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Neil Etheridge | GK → GK | 193186 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/neil-etheridge/193186) | `gkDiving` 63; `agility` 54; `strength` 76; `stamina` 34 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Chatchai Bootprom | GK → GK | 218299 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/chatchai-bootprom/218299) | `gkDiving` 59; `agility` 33; `strength` 55; `stamina` 15 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Caju | DF → LB | 225597 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/caju/225597) | `strength` 71; `aggression` 67; `stamina` 71 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Theerathon Bunmathan | DF → CM **(discrepancy)** | 242351 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/theerathon-bunmathan/242351) | `strength` 46; `aggression` 73; `stamina` 77 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Kenny Dougall | DF → CB | 233105 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kenny-dougall/233105) | `strength` 71; `aggression` 72; `stamina` 75 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Peter Žulj | MF → CM | 221931 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/peter-zulj/221931) | `crossing` 67; `dribbling` 71 (leaf); `agility` 66; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Goran Čaušić | MF → CM | 224600 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/goran-causic/224600) | `crossing` 70; `dribbling` 66 (leaf); `agility` 62; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Darlan | MF → CM | 263789 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/darlan/263789) | `crossing` 52; `dribbling` 70 (leaf); `agility` 77; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Kingsley Schindler | MF → RM | 238569 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kingsley-schindler/238569) | `crossing` 68; `dribbling` 66 (leaf); `agility` 78; `stamina` 67 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Guilherme Bissoli | FW → ST | 256344 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/guilherme-bissoli/256344) | `shootPower` 74; `dribbling` 62 (leaf); `agility` 63 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Robert Žulj | FW → CAM **(discrepancy)** | 201290 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/robert-zulj/201290) | `shootPower` 78; `dribbling` 72 (leaf); `agility` 59 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Paulinho | FW → ST | 207734 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/paulinho/207734) | `shootPower` 72; `dribbling` 77 (leaf); `agility` 90 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Two EA primary positions fall outside the ledger's broad role grouping: Theerathon Bunmathan is stored as `DF` but EA lists `CM`; Robert Žulj is stored as `FW` but EA lists `CAM`. The other ten positions fit their ledger groups. These are observations only and do not change or normalize roster positions.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and EA category summaries are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_afc_23` ledger rows and twelve distinct FC 27 source IDs; every ledger name and ID resolves on its EA individual page and every name appears on the Buriram United team list.
- Position accounting: 10 broad-position matches and 2 documented discrepancies (Theerathon Bunmathan, Robert Žulj).
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
