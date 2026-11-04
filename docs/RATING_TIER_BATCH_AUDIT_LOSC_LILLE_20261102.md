# Rating-tier source batch audit: LOSC Lille (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_uefa_17` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. The official [EA SPORTS FC 27 LOSC Lille ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/losc-lille/65) and all twelve official individual player pages were checked for matching names, identities, primary positions and LOSC Lille affiliation. All twelve stable IDs resolve to the ledger's same-name players; the official team list includes all twelve. Two broad-position discrepancies are recorded below; no identity or club conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items and exclude other item types and later live-form updates in other modes; EA notes club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Berke Özer | GK → GK | 239254 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/berke-ozer/239254) | `gkDiving` 79; `agility` 31; `strength` 61; `stamina` 38 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Arnaud Bodart | GK → GK | 237525 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/arnaud-bodart/237525) | `gkDiving` 72; `agility` 58; `strength` 55; `stamina` 20 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Alexsandro | DF → CB | 269493 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alexsandro/269493) | `strength` 88; `aggression` 82; `stamina` 64 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Romain Perraud | DF → LB | 231318 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/romain-perraud/231318) | `strength` 65; `aggression` 75; `stamina` 82 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Nathan Ngoy | DF → CB | 262071 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nathan-ngoy/262071) | `strength` 83; `aggression` 73; `stamina` 72 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Ayyoub Bouaddi | MF → CDM | 278901 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ayyoub-bouaddi/278901) | `crossing` 59; `dribbling` 79 (leaf); `agility` 69; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Benjamin André | MF → CDM | 190674 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/benjamin-andre/190674) | `crossing` 70; `dribbling` 75 (leaf); `agility` 66; `stamina` 89 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Nabil Bentaleb | MF → CDM | 213296 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nabil-bentaleb/213296) | `crossing` 65; `dribbling` 80 (leaf); `agility` 70; `stamina` 64 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Hamza Igamane | MF → ST **(discrepancy)** | 73449 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hamza-igamane/73449) | `crossing` 58; `dribbling` 79 (leaf); `agility` 80; `stamina` 65 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Matias Fernandez-Pardo | FW → ST | 276048 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matias-fernandez-pardo/276048) | `shootPower` 84; `dribbling` 84 (leaf); `agility` 81 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Hákon Arnar Haraldsson | FW → CAM **(discrepancy)** | 262088 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hakon-arnar-haraldsson/262088) | `shootPower` 66; `dribbling` 81 (leaf); `agility` 86 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Olivier Giroud | FW → ST | 178509 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/olivier-giroud/178509) | `shootPower` 83; `dribbling` 71 (leaf); `agility` 54 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Hamza Igamane is a ledger `MF` with EA primary position `ST`, outside the ledger's broad MF group. Hákon Arnar Haraldsson is a ledger `FW` with EA primary position `CAM`, outside the ledger's broad FW group. These two discrepancies are recorded without changing roster assignments. The other ten EA primary positions fit their ledger broad categories. All twelve stable-ID pages show the ledger's same-name player as an LOSC Lille player; no identity or club conflict was observed.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_17` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; the official team list and all twelve individual pages match names and LOSC Lille affiliation.
- Position accounting: 10 broad-position matches and 2 discrepancies (Hamza Igamane and Hákon Arnar Haraldsson).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.

