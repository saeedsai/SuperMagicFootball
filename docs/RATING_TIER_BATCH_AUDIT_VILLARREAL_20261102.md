# Rating-tier source batch audit: Villarreal (12 players)

**Audit date:** 2026-11-02
**Scope:** Read-only audit of exactly the twelve `cont_uefa_35` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by each row's explicit FC 27 source-player ID. EA's official [FC 27 Villarreal CF ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/villarreal-cf/483) includes all twelve audited names. All twelve stable IDs resolve to same-name players whose official individual pages identify Villarreal CF. No identity or team conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Péter Gulácsi | GK → GK | 185122 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/peter-gulacsi/185122) | `gkDiving` 81; `agility` 41; `strength` 74; `stamina` 37 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Luiz Júnior | GK → GK | 258885 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luiz-junior/258885) | `gkDiving` 78; `agility` 31; `strength` 75; `stamina` 22 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Carlos Romero | DF → LB | 270728 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/carlos-romero/270728) | `strength` 68; `aggression` 76; `stamina` 83 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Juan Foyth | DF → CB | 237221 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/juan-foyth/237221) | `strength` 79; `aggression` 80; `stamina` 66 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Sergi Cardona | DF → LB | 262402 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sergi-cardona/262402) | `strength` 71; `aggression` 74; `stamina` 81 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Pape Gueye | MF → CM | 241707 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pape-gueye/241707) | `crossing` 67; `dribbling` 78 (leaf); `agility` 72; `stamina` 83 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Ayoze | MF → ST **(discrepancy)** | 215590 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ayoze/215590) | `crossing` 80; `dribbling` 80 (leaf); `agility` 80; `stamina` 66 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Santi Comesaña | MF → CM | 235781 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/santi-comesana/235781) | `crossing` 60; `dribbling` 76 (leaf); `agility` 61; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Tajon Buchanan | MF → RM | 246800 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/tajon-buchanan/246800) | `crossing` 67; `dribbling` 78 (leaf); `agility` 77; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Moleiro | FW → LM **(discrepancy)** | 264388 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/moleiro/264388) | `shootPower` 78; `dribbling` 84 (leaf); `agility` 88 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Gerard Moreno | FW → ST | 208093 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gerard-moreno/208093) | `shootPower` 82; `dribbling` 80 (leaf); `agility` 76 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Nicolas Pépé | FW → RW | 226110 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nicolas-pepe/226110) | `shootPower` 84; `dribbling` 84 (leaf); `agility` 90 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Ayoze is stored as ledger `MF`, while EA lists his primary position as `ST`, outside the ledger's broad MF group. Moleiro is stored as ledger `FW`, while EA lists his primary position as `LM`, outside the ledger's broad FW group. The other ten EA primary positions fit their ledger broad categories. The official Villarreal CF team list includes all twelve audited names, and each individual page resolves to the same-name Villarreal CF player. No identity or club conflict was observed.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_35` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's Villarreal CF team list includes all twelve and individual pages corroborate same-name identity and team affiliation.
- Position accounting: 10 broad-position matches and 2 discrepancies (Ayoze: ledger MF, EA ST; Moleiro: ledger FW, EA LM).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
