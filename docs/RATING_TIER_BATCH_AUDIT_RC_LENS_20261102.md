# Rating-tier source batch audit: RC Lens (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the twelve `cont_uefa_16` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. The official [EA SPORTS FC 27 RC Lens ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/rc-lens/64) and all twelve official individual player pages were checked for matching names, identities, primary positions and RC Lens affiliation. All twelve stable IDs resolve to the ledger's same-name players and FC 27 pages identify RC Lens as their team. Three broad-position discrepancies are recorded below; no identity or club conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items and exclude other item types and later live-form updates in other modes; EA notes club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Robin Risser | GK → GK | 271918 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/robin-risser/271918) | `gkDiving` 82; `agility` 31; `strength` 71; `stamina` 36 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Mathieu Gorgelin | GK → GK | 199721 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mathieu-gorgelin/199721) | `gkDiving` 67; `agility` 40; `strength` 70; `stamina` 26 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Matthieu Udol | DF → LB | 229236 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matthieu-udol/229236) | `strength` 82; `aggression` 80; `stamina` 91 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Samson Baidoo | DF → CB | 270997 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/samson-baidoo/270997) | `strength` 86; `aggression` 77; `stamina` 65 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Ismaëlo Ganiou | DF → CB | 75320 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ismaelo-ganiou/75320) | `strength` 81; `aggression` 78; `stamina` 77 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Ruben Aguilar | MF → RB **(discrepancy)** | 223597 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ruben-aguilar/223597) | `crossing` 74; `dribbling` 73 (leaf); `agility` 73; `stamina` 87 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Amadou Haidara | MF → CM | 238463 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/amadou-haidara/238463) | `crossing` 74; `dribbling` 76 (leaf); `agility` 77; `stamina` 74 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Thorgan Hazard | MF → CAM | 203486 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/thorgan-hazard/203486) | `crossing` 74; `dribbling` 77 (leaf); `agility` 84; `stamina` 76 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Florian Sotoca | MF → ST **(discrepancy)** | 227232 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/florian-sotoca/227232) | `crossing` 76; `dribbling` 70 (leaf); `agility` 58; `stamina` 58 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Florian Thauvin | FW → RW | 204970 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/florian-thauvin/204970) | `shootPower` 81; `dribbling` 84 (leaf); `agility` 78 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Odsonne Édouard | FW → ST | 233866 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/odsonne-edouard/233866) | `shootPower` 78; `dribbling` 76 (leaf); `agility` 62 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Saud Abdulhamid | FW → RB **(discrepancy)** | 246688 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/saud-abdulhamid/246688) | `shootPower` 68; `dribbling` 76 (leaf); `agility` 82 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Ruben Aguilar's EA primary position is RB while the ledger records MF; Florian Sotoca's EA primary position is ST while the ledger records MF; and Saud Abdulhamid's EA primary position is RB while the ledger records FW. These three broad-position discrepancies are kept as audit findings without changing roster assignments. The other nine EA primary positions fit their ledger broad categories. All twelve stable-ID pages identify the ledger's same-name player as an RC Lens player; no identity or club conflict was found.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, the direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_16` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; all twelve individual EA pages match the ledger identity and identify RC Lens affiliation.
- Position accounting: 9 broad-position matches and 3 discrepancies (Ruben Aguilar, Florian Sotoca, Saud Abdulhamid).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
