# Rating-tier source batch audit: Monterrey (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_concacaf_14` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each stable FC 27 source ID was checked against its official EA SPORTS individual ratings page and the official [Monterrey team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/monterrey/1032). All twelve IDs resolve to the listed same-name players and all twelve names appear on EA's Monterrey team list. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly corresponds to a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Shooting, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages reflect launch Gold, Silver, and Bronze Ultimate Team player items, exclude other item types and later live-form updates in other modes, and note that club affiliations can change. Values below are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger broad position followed by EA's primary position. Positions outside the existing broad role grouping are recorded as discrepancies without changing or normalizing game positions. “—” means no direct same-name EA leaf for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Luis Cárdenas | GK → GK | 216245 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luis-cardenas/216245) | `gkDiving` 66; `agility` 32; `strength` 67; `stamina` 28 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Esteban Andrada | GK → GK | 205849 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/esteban-andrada/205849) | `gkDiving` 63; `agility` 34; `strength` 62; `stamina` 45 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Víctor Guzmán | DF → CB | 255218 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/victor-guzman/255218) | `strength` 84; `aggression` 71; `stamina` 77 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Jorge Rodríguez | DF → CDM **(discrepancy)** | 224796 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jorge-rodriguez/224796) | `strength` 81; `aggression` 68; `stamina` 88 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Gerardo Arteaga | DF → LB | 236537 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gerardo-arteaga/236537) | `strength` 58; `aggression` 72; `stamina` 81 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Orbelín Pineda | MF → CAM | 224574 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/orbelin-pineda/224574) | `crossing` 73; `dribbling` 81 (leaf); `agility` 88; `stamina` 86 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Diego Rossi | MF → CAM | 241907 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/diego-rossi/241907) | `crossing` 69; `dribbling` 75 (leaf); `agility` 84; `stamina` 82 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Luca Orellano | MF → LM | 246423 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luca-orellano/246423) | `crossing` 65; `dribbling` 78 (leaf); `agility` 91; `stamina` 74 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Fidel Ambríz | MF → CDM | 255394 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/fidel-ambriz/255394) | `crossing` 47; `dribbling` 60 (leaf); `agility` 60; `stamina` 79 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Hugo Cuypers | FW → ST | 233630 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hugo-cuypers/233630) | `shootPower` 81; `dribbling` 69 (leaf); `agility` 66 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Óliver Torres | FW → CM **(discrepancy)** | 208777 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/oliver-torres/208777) | `shootPower` 72; `dribbling` 81 (leaf); `agility` 75 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Lucas Ocampos | FW → LW | 205632 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lucas-ocampos/205632) | `shootPower` 81; `dribbling` 79 (leaf); `agility` 75 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Two EA primary positions fall outside the ledger's broad role grouping: Jorge Rodríguez is stored as `DF` but EA lists `CDM`; Óliver Torres is stored as `FW` but EA lists `CM`. The other ten positions fit their ledger groups. These observations do not change or normalize roster positions.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and EA category summaries are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_concacaf_14` ledger rows and twelve distinct FC 27 source IDs; all twelve identities are present on their EA individual pages and the Monterrey team ratings list.
- Position accounting: 10 broad-position matches and 2 documented discrepancies (Jorge Rodríguez, Óliver Torres).
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
