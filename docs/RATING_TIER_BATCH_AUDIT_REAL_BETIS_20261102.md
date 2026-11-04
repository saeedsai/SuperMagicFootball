# Rating-tier source batch audit: Real Betis (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the twelve `cont_uefa_25` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. The official [EA SPORTS FC 27 Real Betis team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/real-betis/449) and each of the twelve official individual player pages were checked for same-name identity, primary position, and Real Betis affiliation. All twelve stable IDs resolve to the ledger's same-name player; no identity or club conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items and exclude other item types and later live-form updates in other modes; EA notes club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Álvaro Valles | GK → GK | 246657 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alvaro-valles/246657) | `gkDiving` 77; `agility` 38; `strength` 65; `stamina` 40 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Diego Conde | GK → GK | 258534 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/diego-conde/258534) | `gkDiving` 74; `agility` 58; `strength` 62; `stamina` 39 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Bartra | DF → CB | 198141 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bartra/198141) | `strength` 80; `aggression` 76; `stamina` 67 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Diego Llorente | DF → CB | 212602 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/diego-llorente/212602) | `strength` 78; `aggression` 84; `stamina` 65 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Natan | DF → CB | 277537 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/natan/277537) | `strength` 83; `aggression` 82; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Isco | MF → CAM | 197781 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/isco/197781) | `crossing` 84; `dribbling` 86 (leaf); `agility` 82; `stamina` 67 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Fornals | MF → CM | 226456 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/fornals/226456) | `crossing` 85; `dribbling` 79 (leaf); `agility` 76; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Giovani Lo Celso | MF → CAM | 226226 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/giovani-lo-celso/226226) | `crossing` 79; `dribbling` 80 (leaf); `agility` 79; `stamina` 67 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Marc Roca | MF → CDM | 235945 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marc-roca/235945) | `crossing` 67; `dribbling` 74 (leaf); `agility` 65; `stamina` 68 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Abde | FW → LW | 264432 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/abde/264432) | `shootPower` 76; `dribbling` 86 (leaf); `agility` 84 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Antony | FW → RW | 255475 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/antony/255475) | `shootPower` 84; `dribbling` 80 (leaf); `agility` 90 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Cucho Hernández | FW → ST | 237034 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/cucho-hernandez/237034) | `shootPower` 79; `dribbling` 82 (leaf); `agility` 81 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

All twelve EA primary positions fit their ledger broad GK, DF, MF or FW category. There are **12 broad-position matches and 0 discrepancies**. No identity or club conflicts were found. The individual pages checked identify the ledger same-name player and Real Betis affiliation.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, the direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_25` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; all twelve individual EA pages resolve to the matching name and Real Betis player.
- Position accounting: 12 broad-position matches and 0 discrepancies.
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
