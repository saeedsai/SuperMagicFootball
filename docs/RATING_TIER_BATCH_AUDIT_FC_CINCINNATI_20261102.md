# Rating-tier source batch audit: FC Cincinnati (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_concacaf_20` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by each row's explicit FC 27 source-player ID. EA's [official FC 27 FC Cincinnati ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/fc-cincinnati/113149) contains all twelve audited names. Each official individual EA page corroborates the matching player name and FC Cincinnati affiliation. No identity or team conflicts were observed. No roster, ledger, tier, verification, or game data were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. FC 27 player pages reflect launch Gold, Silver, and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Roman Celentano | GK → GK | 266382 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/roman-celentano/266382) | `gkDiving` 72; `agility` 24; `strength` 77; `stamina` 24 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Evan Louro | GK → GK | 237399 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/evan-louro/237399) | `gkDiving` 62; `agility` 44; `strength` 78; `stamina` 36 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Miles Robinson | DF → CB | 237255 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/miles-robinson/237255) | `strength` 80; `aggression` 76; `stamina` 78 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Matt Miazga | DF → CB | 215565 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matt-miazga/215565) | `strength` 83; `aggression` 75; `stamina` 67 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Obinna Nwobodo | DF → CM **(discrepancy)** | 258881 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/obinna-nwobodo/258881) | `strength` 65; `aggression` 75; `stamina` 90 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Bryan Ramírez | MF → LM | 273969 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bryan-ramirez/273969) | `crossing` 71; `dribbling` 73 (leaf); `agility` 79; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Ender Echenique | MF → RM | 275515 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ender-echenique/275515) | `crossing` 52; `dribbling` 72 (leaf); `agility` 82; `stamina` 66 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Kyle Smith | MF → RB **(discrepancy)** | 247356 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kyle-smith/247356) | `crossing` 54; `dribbling` 56 (leaf); `agility` 65; `stamina` 70 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Samuel Gidi | MF → CDM | 81424 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/samuel-gidi/81424) | `crossing` 39; `dribbling` 61 (leaf); `agility` 76; `stamina` 82 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Evander | FW → CAM **(discrepancy)** | 234505 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/evander/234505) | `shootPower` 78; `dribbling` 83 (leaf); `agility` 80 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Kévin Denkey | FW → ST | 237254 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kevin-denkey/237254) | `shootPower` 83; `dribbling` 74 (leaf); `agility` 63 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Pavel Bucha | FW → CM **(discrepancy)** | 244788 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pavel-bucha/244788) | `shootPower` 71; `dribbling` 74 (leaf); `agility` 85 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Obinna Nwobodo is stored as ledger `DF`, while EA lists `CM`; Kyle Smith is stored as `MF`, while EA lists `RB`; Evander is stored as `FW`, while EA lists `CAM`; and Pavel Bucha is stored as `FW`, while EA lists `CM`. The other eight EA primary positions fit their ledger broad categories. The official FC Cincinnati list and all twelve same-name individual profiles support the player/team matches; no identity or club conflicts were observed.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By ledger group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating, or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_concacaf_20` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's FC Cincinnati list includes all twelve and each individual profile corroborates the same-name identity and club.
- Position accounting: 8 broad-position matches and 4 discrepancies (Obinna Nwobodo: DF→CM; Kyle Smith: MF→RB; Evander: FW→CAM; Pavel Bucha: FW→CM).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index, and backlog were not edited.
