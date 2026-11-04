# Rating-tier source batch audit: Bolívar (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_13` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using each row's stable `fc27_source_player_id`. EA's official [Bolívar FC 27 team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/bolivar/110968) and the FC 27 individual pages linked below were checked for the stable ID, player identity, position, club affiliation, and directly labelled attribute leaves. All twelve ledger names and IDs resolve to same-name FC 27 Bolívar pages and appear on EA's Bolívar team list. No identity or team conflicts were found. No roster, source ledger, game data, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individual EA attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the observed value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA states its FC 27 rating pages reflect launch Gold, Silver, and Bronze Ultimate Team items, not other item types or later live-form updates. Sources checked 2026-11-02.

## Identity and directly observed canonical fields

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are retained as source observations but do not invalidate directly observed leaves when stable identity and team match.

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Carlos Lampe | GK → GK | 196885 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/carlos-lampe/196885) | `gkDiving` 69; `agility` 32; `strength` 70; `stamina` 35 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Diego Méndez | GK → GK | 259930 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/diego-mendez/259930) | `gkDiving` 62; `agility` 23; `strength` 49; `stamina` 23 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| José Sagredo | DF → LB | 238375 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jose-sagredo/238375) | `strength` 72; `aggression` 73; `stamina` 74 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Xavier Arreaga | DF → CB | 246406 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/xavier-arreaga/246406) | `strength` 71; `aggression` 72; `stamina` 75 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Santiago Echeverría | DF → CB | 226447 — [EA player page](https://careers.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/santiago-echeverria/226447) | `strength` 82; `aggression` 64; `stamina` 51 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Robson Matheus | MF → CM | 274259 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/robson-matheus/274259) | `crossing` 58; `dribbling` 71 (leaf); `agility` 69; `stamina` 74 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Carlos Melgar | MF → CM | 253574 — [EA player page](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/carlos-melgar/253574) | `crossing` 67; `dribbling` 72 (leaf); `agility` 79; `stamina` 71 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Damián Batallini | MF → RW **(discrepancy)** | 232709 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/damian-batallini/232709) | `crossing` 73; `dribbling` 75 (leaf); `agility` 78; `stamina` 59 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Leonel Justiniano | MF → CDM | 241131 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/leonel-justiniano/241131) | `crossing` 58; `dribbling` 59 (leaf); `agility` 67; `stamina` 82 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Martín Cauteruccio | FW → ST | 215292 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/martin-cauteruccio/215292) | `shootPower` 76; `dribbling` 67 (leaf); `agility` 60 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Dairon Asprilla | FW → ST | 214354 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dairon-asprilla/214354) | `shootPower` 80; `dribbling` 68 (leaf); `agility` 71 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Patricio Rodríguez | FW → LW **(discrepancy)** | 207454 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/patricio-rodriguez/207454) | `shootPower` 65; `dribbling` 76 (leaf); `agility` 78 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

Damián Batallini's EA primary position RW falls outside the ledger MF broad position; Patricio Rodríguez's EA primary position LW falls outside the ledger FW broad position. These two cross-category discrepancies are recorded without changing roster assignments. The other ten EA primary positions fit their ledger broad GK, DF, MF, or FW categories. EA's official team list shows all twelve audited same-name players at Bolívar; each stable-ID individual page also identifies the same-name player as belonging to Bolívar.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved slots. There are **zero identity/team conflicts**, so no direct leaf observations were excluded from trusted coverage. No player has all six position inputs directly observed under the conservative matching rule. No EA group summary or OVR was copied into game data; no tier or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_13` ledger rows and twelve distinct stable FC 27 source IDs; EA's team list and all twelve linked FC 27 individual pages corroborate names, IDs, positions, and Bolívar affiliation.
- Position accounting: 10 broad-position matches and 2 cross-category discrepancies (Damián Batallini, Patricio Rodríguez).
- Identity/team conflicts: none; 0 conflicted leaves excluded from trusted coverage.
- Field accounting: 42 trusted direct leaves + 30 unresolved slots = 72.
- Ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: only this audit report was created; no roster, source-ledger, game-data, tier, backlog, or shared index files were edited.
