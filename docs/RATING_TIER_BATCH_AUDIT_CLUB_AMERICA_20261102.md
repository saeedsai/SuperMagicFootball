# Rating-tier source batch audit: Club América (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_concacaf_15` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The twelve stable FC 27 source IDs were checked against official EA SPORTS individual player pages and the official [Club América FC 27 ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/club-america/1879). All twelve names occur on the team list, and the individual pages identify the listed Club América players. No roster data, source-ledger fields, canonical inputs, identities, tiers, or verification flags were changed.

## Source and method

Canonical field slots are from `data/mechanics/gameplay.json` → `positionOverallStats`. I count only a directly matching individual EA attribute leaf. Category summaries such as EA `Passing`, `Pace`, `Defending`, `Dribbling`, and `Physicality` are not direct evidence for the similarly named game inputs. The separately repeated `Dribbling` leaf is counted. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not `heading`; `GK Reflexes` is not `gkSkill`.

`Game → EA` lists the ledger's broad role and EA's primary position. EA's FC 27 page describes launch Gold, Silver, and Bronze Ultimate Team player items, not other item types or live-form updates in other modes. Club affiliation can change. These source observations do not imply an EA-to-game scale, formula, rating, tier, or eligibility. “—” means no direct same-name EA leaf was present for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Luis Ángel Malagón | GK → GK | 232654 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luis-angel-malagon/232654) | `gkDiving` 74; `agility` 21; `strength` 51; `stamina` 24 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Rodolfo Cota | GK → GK | 186098 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rodolfo-cota/186098) | `gkDiving` 67; `agility` 52; `strength` 80; `stamina` 36 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Israel Reyes | DF → RB | 252008 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/israel-reyes/252008) | `strength` 74; `aggression` 77; `stamina` 80 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Sebastián Cáceres | DF → CB | 253257 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sebastian-caceres/253257) | `strength` 76; `aggression` 79; `stamina` 80 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Cristian Borja | DF → LB | 227153 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/cristian-borja/227153) | `strength` 75; `aggression` 75; `stamina` 70 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Raphael Veiga | MF → CAM | 234439 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/raphael-veiga/234439) | `crossing` 74; `dribbling` 80 (leaf); `agility` 80; `stamina` 71 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Alexis Gutiérrez | MF → CM | 246745 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alexis-gutierrez/246745) | `crossing` 67; `dribbling` 74 (leaf); `agility` 70; `stamina` 77 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Alan Cervantes | MF → CDM | 239617 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alan-cervantes/239617) | `crossing` 51; `dribbling` 64 (leaf); `agility` 65; `stamina` 87 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Víctor Dávila | MF → ST **(discrepancy)** | 225455 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/victor-davila/225455) | `crossing` 45; `dribbling` 72 (leaf); `agility` 77; `stamina` 67 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Alejandro Zendejas | FW → RW | 226579 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alejandro-zendejas/226579) | `shootPower` 80; `dribbling` 82 (leaf); `agility` 91 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Brian Rodríguez | FW → LW | 253061 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/brian-rodriguez/253061) | `shootPower` 70; `dribbling` 81 (leaf); `agility` 85 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Erick Sánchez | FW → CM **(discrepancy)** | 235537 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/erick-sanchez/235537) | `shootPower` 80; `dribbling` 68 (leaf); `agility` 82 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Ten EA positions fit the ledger's broad role. Two are cross-category discrepancies: Víctor Dávila is stored as `MF` and listed by EA as `ST`; Erick Sánchez is stored as `FW` and listed by EA as `CM`. This records the mismatch without normalizing positions or changing the ledger.

This batch contains **42 of 72** direct same-name leaf observations and **30** unresolved canonical field slots. No player has all six position-specific fields directly observed. Group summaries and related but non-identical leaves remain unresolved; no game rating, tier, eligibility, or assignment was inferred or changed.

## Focused audit validation

- Membership: exactly twelve `cont_concacaf_15` rows and twelve distinct stable FC 27 source IDs; each ID resolves to the same-name EA individual page, and all twelve names are present in EA's Club América FC 27 team list.
- Position accounting: 10 broad-position matches; 2 documented discrepancies (Víctor Dávila and Erick Sánchez).
- Field accounting: 42 direct observations + 30 unresolved slots = 72.
- Source-ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this new audit report is the only file created; no roster data, source-ledger fields, or shared backlog/index files were changed.
