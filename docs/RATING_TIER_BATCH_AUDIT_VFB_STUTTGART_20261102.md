# Rating-tier source batch audit: VfB Stuttgart (12 players)

**Audit date:** 2026-11-02
**Scope:** Read-only audit of exactly the twelve `cont_uefa_33` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by each row's explicit FC 27 source-player ID. EA's official [FC 27 VfB Stuttgart ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/vfb-stuttgart/36) includes all twelve audited names. All twelve stable IDs resolve to same-name players whose official individual pages identify VfB Stuttgart. No identity or team conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Dennis Seimen | GK → GK | 271114 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dennis-seimen/271114) | `gkDiving` 72; `agility` 38; `strength` 77; `stamina` 36 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Fabian Bredlow | GK → GK | 223603 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/fabian-bredlow/223603) | `gkDiving` 71; `agility` 50; `strength` 62; `stamina` 20 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Maximilian Mittelstädt | DF → LB | 227647 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/maximilian-mittelstadt/227647) | `strength` 68; `aggression` 77; `stamina` 84 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Julian Chabot | DF → CB | 239340 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/julian-chabot/239340) | `strength` 91; `aggression` 91; `stamina` 70 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Ramon Hendriks | DF → CB | 251829 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ramon-hendriks/251829) | `strength` 76; `aggression` 78; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Angelo Stiller | MF → CDM | 250959 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/angelo-stiller/250959) | `crossing` 80; `dribbling` 83 (leaf); `agility` 82; `stamina` 83 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Chris Führich | MF → LM | 241925 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/chris-fuhrich/241925) | `crossing` 72; `dribbling` 84 (leaf); `agility` 86; `stamina` 76 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Jamie Leweling | MF → RM | 252448 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jamie-leweling/252448) | `crossing` 77; `dribbling` 84 (leaf); `agility` 77; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Grischa Prömel | MF → CM | 228595 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/grischa-promel/228595) | `crossing` 61; `dribbling` 74 (leaf); `agility` 68; `stamina` 82 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Deniz Undav | FW → ST | 244176 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/deniz-undav/244176) | `shootPower` 88; `dribbling` 82 (leaf); `agility` 75 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Ermedin Demirović | FW → ST | 238900 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ermedin-demirovic/238900) | `shootPower` 85; `dribbling` 78 (leaf); `agility` 70 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Bilal El Khannouss | FW → CAM **(discrepancy)** | 257504 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bilal-el-khannouss/257504) | `shootPower` 65; `dribbling` 84 (leaf); `agility` 87 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Bilal El Khannouss is stored as ledger `FW`, while EA lists his primary position as `CAM`, outside the ledger's broad FW group. The other eleven EA primary positions match their ledger broad categories. The official VfB Stuttgart team list includes all twelve audited names, and each individual page resolves to the same-name VfB Stuttgart player. No identity or club conflict was observed.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_33` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's VfB Stuttgart team list includes all twelve and individual pages corroborate same-name identity and team affiliation.
- Position accounting: 11 broad-position matches and 1 discrepancy (Bilal El Khannouss: ledger FW, EA CAM).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
