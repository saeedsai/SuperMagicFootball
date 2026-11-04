# Rating-tier source batch audit: Pohang Steelers (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_afc_22` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each stable FC 27 source ID was checked against its official EA SPORTS individual ratings page and the official [Pohang Steelers team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/pohang-steelers/1474). All twelve IDs resolve to the listed individuals, whose individual EA pages identify Pohang Steelers; all twelve names appear on the official team ratings list. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Shooting, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute values are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. Positions outside the existing broad role grouping are documented as discrepancies without changing or normalizing the game positions. “—” means no direct same-name EA leaf for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Hwang In Jae | GK → GK | 233286 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hwang-in-jae/233286) | `gkDiving` 72; `agility` 33; `strength` 59; `stamina` 36 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Yoon Pyung Gook | GK → GK | 212915 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yoon-pyung-gook/212915) | `gkDiving` 58; `agility` 32; `strength` 75; `stamina` 25 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Jeon Min Gwang | DF → CB | 227632 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jeon-min-gwang/227632) | `strength` 84; `aggression` 68; `stamina` 80 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Eo Jeong Won | DF → LB | 261078 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/eo-jeong-won/261078) | `strength` 62; `aggression` 50; `stamina` 78 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Park Chan Yong | DF → CB | 256252 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/park-chan-yong/256252) | `strength` 78; `aggression` 65; `stamina` 67 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Ki Sung Yueng | MF → CM | 180283 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ki-sung-yueng/180283) | `crossing` 69; `dribbling` 60 (leaf); `agility` 60; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Jorge Teixeira | MF → ST **(discrepancy)** | 274437 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jorge-teixeira/274437) | `crossing` 38; `dribbling` 61 (leaf); `agility` 61; `stamina` 74 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Shin Kwang Hoon | MF → RB **(discrepancy)** | 184901 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/shin-kwang-hoon/184901) | `crossing` 62; `dribbling` 58 (leaf); `agility` 66; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Kento Nishiya | MF → CDM | 83628 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kento-nishiya/83628) | `crossing` 51; `dribbling` 61 (leaf); `agility` 73; `stamina` 79 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Wanderson | FW → LB **(discrepancy)** | 229343 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/wanderson/229343) | `shootPower` 72; `dribbling` 72 (leaf); `agility` 74 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Juninho Rocha | FW → RM **(discrepancy)** | 261880 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/juninho-rocha/261880) | `shootPower` 59; `dribbling` 68 (leaf); `agility` 78 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Jakob Tranziska | FW → ST | 78655 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jakob-tranziska/78655) | `shootPower` 61; `dribbling` 66 (leaf); `agility` 67 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Four EA primary positions fall outside the ledger's broad role grouping: Jorge Teixeira is stored as `MF` but EA lists `ST`; Shin Kwang Hoon is stored as `MF` but EA lists `RB`; Wanderson is stored as `FW` but EA lists `LB`; and Juninho Rocha is stored as `FW` but EA lists `RM`. The other eight positions fit their ledger groups. These discrepancies are recorded without changing or normalizing roster positions.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and EA category summaries are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_afc_22` ledger rows and twelve distinct FC 27 source IDs; all twelve identities are present in official individual profiles and the Pohang Steelers team ratings list.
- Position accounting: 8 broad-position matches and 4 documented discrepancies (Jorge Teixeira, Shin Kwang Hoon, Wanderson, Juninho Rocha).
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
