# Rating-tier source batch audit: Universitario (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_15` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by each row's explicit FC 27 source-player ID. EA's official [FC 27 Universitario team ratings list](https://www.ea.com/es/games/ea-sports-fc/ratings/teams-ratings/universitario/111014) contains all twelve audited names. Each stable ID opens an official same-name individual profile that identifies the player as Universitario. No identity or team conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Diego Romero | GK → GK | 259606 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/diego-romero/259606) | `gkDiving` 66; `agility` 23; `strength` 75; `stamina` 28 | `gkSkill` (EA label GK Reflexes); `passing` (Passing is a group summary) |
| Miguel Vargas | GK → GK | 229397 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/miguel-vargas/229397) | `gkDiving` 66; `agility` 38; `strength` 66; `stamina` 42 | `gkSkill` (EA label GK Reflexes); `passing` (Passing is a group summary) |
| Anderson Santamaría | DF → CB | 236260 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/anderson-santamaria/236260) | `strength` 87; `aggression` 89; `stamina` 72 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Caín Fara | DF → RB | 251225 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/cain-fara/251225) | `strength` 79; `aggression` 86; `stamina` 72 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Williams Riveros | DF → CB | 240138 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/williams-riveros/240138) | `strength` 86; `aggression` 70; `stamina` 68 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Jairo Concha | MF → CM | 264796 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/jairo-concha/264796) | `crossing` 55; `dribbling` 80 (leaf); `agility` 86; `stamina` 75 | `passing` (Passing is a group summary); `speedRating` (Pace summary) |
| César Inga | MF → LB **(discrepancy)** | 279076 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/cesar-inga/279076) | `crossing` 68; `dribbling` 59 (leaf); `agility` 65; `stamina` 70 | `passing` (Passing is a group summary); `speedRating` (Pace summary) |
| Lisandro Alzugaray | MF → ST **(discrepancy)** | 245357 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/lisandro-alzugaray/245357) | `crossing` 62; `dribbling` 68 (leaf); `agility` 71; `stamina` 67 | `passing` (Passing is a group summary); `speedRating` (Pace summary) |
| José Rivera | MF → ST **(discrepancy)** | 265627 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/jose-rivera/265627) | `crossing` 60; `dribbling` 72 (leaf); `agility` 66; `stamina` 62 | `passing` (Passing is a group summary); `speedRating` (Pace summary) |
| Alex Valera | FW → ST | 259251 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/alex-valera/259251) | `shootPower` 74; `dribbling` 66 (leaf); `agility` 64 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Andy Polo | FW → RM **(discrepancy)** | 223637 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/andy-polo/223637) | `shootPower` 60; `dribbling` 72 (leaf); `agility` 84 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Edison Flores | FW → ST | 210951 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/edison-flores/210951) | `shootPower` 72; `dribbling` 72 (leaf); `agility` 74 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

EA lists César Inga at LB, Lisandro Alzugaray and José Rivera at ST, and Andy Polo at RM, outside their respective ledger broad categories MF, MF, MF and FW. The other eight EA primary positions fit the ledger's broad GK/DF/MF/FW position. These differences are recorded without changing roster positions. The official team list and individual pages corroborate all twelve names, IDs, and Universitario affiliation.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating, or OVR was copied into game data; no tier or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_15` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; the official EA team list and individual profiles corroborate all twelve identities and club affiliations.
- Profile links: twelve official links were checked; each URL's terminal player ID matches its ledger source ID.
- Position accounting: 8 broad-position matches and 4 discrepancies (César Inga, Lisandro Alzugaray, José Rivera, Andy Polo).
- Identity/team conflicts: none observed; no conflicted leaves were excluded from the direct total.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index, and backlog were not edited.
