# Rating-tier source batch audit: Slavia Prague (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_uefa_30` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. EA names this club Slavia Praha. Its official [EA SPORTS FC 27 Slavia Praha ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/slavia-praha/266) and all twelve official individual player pages were checked for matching names, identities, primary positions and Slavia Praha affiliation. All twelve stable IDs resolve to the ledger's same-name players and appear on the official team list. Two broad-position discrepancies are recorded below; no identity or club conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items and exclude other item types and later live-form updates in other modes; EA notes club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are retained as source observations but do not invalidate directly observed leaves when stable identity and team match.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Jakub Markovič | GK → GK | 252179 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jakub-markovic/252179) | `gkDiving` 72; `agility` 28; `strength` 53; `stamina` 21 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Jindřich Staněk | GK → GK | 221909 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jindrich-stanek/221909) | `gkDiving` 72; `agility` 27; `strength` 68; `stamina` 26 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Štěpán Chaloupek | DF → CB | 73456 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/stepan-chaloupek/73456) | `strength` 81; `aggression` 77; `stamina` 79 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| David Zima | DF → CB | 255687 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/david-zima/255687) | `strength` 78; `aggression` 70; `stamina` 71 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Tomáš Holeš | DF → CB | 251116 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/tomas-holes/251116) | `strength` 81; `aggression` 80; `stamina` 77 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Michal Sadílek | MF → CDM | 245209 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/michal-sadilek/245209) | `crossing` 71; `dribbling` 69 (leaf); `agility` 72; `stamina` 86 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| David Douděra | MF → RM | 269509 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/david-doudera/269509) | `crossing` 74; `dribbling` 69 (leaf); `agility` 82; `stamina` 85 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| David Moses | MF → CM | 76098 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/david-moses/76098) | `crossing` 63; `dribbling` 74 (leaf); `agility` 73; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| David Jurásek | MF → LB **(discrepancy)** | 267594 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/david-jurasek/267594) | `crossing` 76; `dribbling` 71 (leaf); `agility` 71; `stamina` 77 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lukáš Provod | FW → CAM **(discrepancy)** | 253727 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lukas-provod/253727) | `shootPower` 82; `dribbling` 79 (leaf); `agility` 73 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Mojmír Chytil | FW → ST | 274906 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mojmir-chytil/274906) | `shootPower` 74; `dribbling` 69 (leaf); `agility` 58 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Tomáš Chorý | FW → ST | 244793 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/tomas-chory/244793) | `shootPower` 77; `dribbling` 66 (leaf); `agility` 38 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

David Jurásek's EA primary position is LB while the ledger records MF; Lukáš Provod's EA primary position is CAM while the ledger records FW. These two broad-position discrepancies are recorded without changing roster assignments. The other ten EA primary positions fit their ledger broad categories. EA's Slavia Praha list includes all twelve audited names, and each stable-ID individual page resolves to the same-name Slavia Praha player. No identity or club conflict was observed.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_30` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's Slavia Praha team list includes all twelve and individual player pages corroborate same-name identities and team affiliation.
- Position accounting: 10 broad-position matches and 2 discrepancies (David Jurásek and Lukáš Provod).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.

