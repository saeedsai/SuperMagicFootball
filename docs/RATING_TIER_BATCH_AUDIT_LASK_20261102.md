# Rating-tier source batch audit: LASK (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the twelve `cont_uefa_14` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. The official [EA SPORTS FC 27 LASK ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/lask/252) and all twelve official individual player pages were checked for matching names, identities, primary positions and LASK affiliation. All twelve stable IDs resolve to the ledger's same-name players and the FC 27 pages identify LASK as their team. One broad-position discrepancy is recorded below; no identity or club conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items and exclude other item types and later live-form updates in other modes; EA notes club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Lukas Jungwirth | GK → GK | 262944 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lukas-jungwirth/262944) | `gkDiving` 69; `agility` 43; `strength` 60; `stamina` 29 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Tobias Schützenauer | GK → GK | 223868 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/tobias-schutzenauer/223868) | `gkDiving` 63; `agility` 32; `strength` 44; `stamina` 24 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Andrés Andrade | DF → CB | 252873 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/andres-andrade/252873) | `strength` 78; `aggression` 71; `stamina` 85 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| João Tornich | DF → CB | 273935 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joao-tornich/273935) | `strength` 81; `aggression` 70; `stamina` 75 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Xavier Mbuyamba | DF → CB | 271658 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/xavier-mbuyamba/271658) | `strength` 83; `aggression` 65; `stamina` 71 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Sascha Horvath | MF → CM | 213301 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sascha-horvath/213301) | `crossing` 68; `dribbling` 73 (leaf); `agility` 92; `stamina` 83 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Robert Ljubičić | MF → CM | 243525 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/robert-ljubicic/243525) | `crossing` 65; `dribbling` 73 (leaf); `agility` 74; `stamina` 82 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Kasper Jørgensen | MF → RM | 247782 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kasper-j-rgensen/247782) | `crossing` 68; `dribbling` 63 (leaf); `agility` 68; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Kryštof Daněk | MF → CAM | 269512 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/krystof-danek/269512) | `crossing` 71; `dribbling` 73 (leaf); `agility` 76; `stamina` 60 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Moses Usor | FW → ST | 271092 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/moses-usor/271092) | `shootPower` 75; `dribbling` 73 (leaf); `agility` 84 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Samuel Adeniran | FW → ST | 263702 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/samuel-adeniran/263702) | `shootPower` 77; `dribbling` 55 (leaf); `agility` 46 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| George Bello | FW → LB **(discrepancy)** | 242628 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/george-bello/242628) | `shootPower` 55; `dribbling` 71 (leaf); `agility` 88 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

George Bello's EA primary position is LB while the ledger records FW. This is a broad-position discrepancy, kept as an audit finding without changing his roster position. The other eleven EA positions fit their ledger broad-position categories. All twelve stable-ID pages identify the ledger's same-name player as a LASK player; no identity or club conflict was found.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, the direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_14` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; all twelve individual EA pages match the ledger identity and identify LASK affiliation.
- Position accounting: 11 broad-position matches and 1 discrepancy (George Bello, FW → LB).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
