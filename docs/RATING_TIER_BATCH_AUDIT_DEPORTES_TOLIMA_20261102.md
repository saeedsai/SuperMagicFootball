# Rating-tier source batch audit: Deportes Tolima (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_29` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by each row's explicit FC 27 source-player ID. The official EA FC 27 individual pages for all twelve IDs resolve to same-name players whose listed team is Deportes Tolima. No identity or club conflicts were observed. One stored broad position differs from the EA primary position. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Neto Volpi | GK → GK | 207899 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/neto-volpi/207899) | `gkDiving` 72; `agility` 31; `strength` 81; `stamina` 43 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Miguel Ortega | GK → GK | 237695 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/miguel-ortega/237695) | `gkDiving` 67; `agility` 48; `strength` 64; `stamina` 26 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Junior Hernández | DF → LB | 252990 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/junior-hernandez/252990) | `strength` 59; `aggression` 48; `stamina` 70 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Anderson Angulo | DF → CB | 243004 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/anderson-angulo/243004) | `strength` 82; `aggression` 74; `stamina` 65 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Yordan Osorio | DF → CB | 237297 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yordan-osorio/237297) | `strength` 77; `aggression` 77; `stamina` 66 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Bryan Rovira | MF → CDM | 225812 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bryan-rovira/225812) | `crossing` 56; `dribbling` 62 (leaf); `agility` 63; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Homer Martínez | MF → CDM | 235665 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/homer-martinez/235665) | `crossing` 33; `dribbling` 40 (leaf); `agility` 73; `stamina` 73 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Sebastián Guzmán | MF → CDM | 243011 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sebastian-guzman/243011) | `crossing` 53; `dribbling` 59 (leaf); `agility` 66; `stamina` 82 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Jherson Mosquera | MF → RB **(discrepancy)** | 255607 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jherson-mosquera/255607) | `crossing` 63; `dribbling` 50 (leaf); `agility` 71; `stamina` 78 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Luis Sandoval | FW → ST | 236604 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luis-sandoval/236604) | `shootPower` 71; `dribbling` 67 (leaf); `agility` 71 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Adrián Parra | FW → ST | 232385 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/adrian-parra/232385) | `shootPower` 66; `dribbling` 62 (leaf); `agility` 66 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Edwar López | FW → ST | 242339 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/edwar-lopez/242339) | `shootPower` 70; `dribbling` 69 (leaf); `agility` 72 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Jherson Mosquera is stored as ledger `MF`, while EA lists his primary position as `RB`, outside the ledger's broad MF group. The other eleven EA primary positions fit their ledger broad categories. Each official individual page for the audited ID identifies the same-name player and Deportes Tolima. No identity or club conflict was observed.

The individual pages expose **43 of 72** direct same-name canonical-field observations, leaving **29** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_29` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; each official individual page URL ends in its ledger source ID and corroborates the same-name player and club.
- Position accounting: 11 broad-position matches and 1 discrepancy (Jherson Mosquera: ledger MF, EA RB).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 43 directly observed leaves + 29 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
