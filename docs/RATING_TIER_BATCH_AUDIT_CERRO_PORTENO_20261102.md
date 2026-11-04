# Rating-tier source batch audit: Cerro Porteño (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_11` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using each row's stable `fc27_source_player_id`. This is the next not-yet-audited 12-player continental club batch with all twelve stable source IDs populated; the immediately preceding Estudiantes de La Plata rows have no source IDs and are not eligible for a stable-ID audit. EA's official [Cerro Porteño FC 27 team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/cerro-porteno/112716) and the stable-ID FC 27 individual pages were checked for identity, position, and club affiliation. All twelve stable-ID pages resolve to the ledger's same-name player at Cerro Porteño. No identity or team conflicts were found. No roster, ledger, game, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA's FC 27 pages describe launch Gold, Silver and Bronze Ultimate Team items; they exclude other item types and later live-form updates. Sources checked on 2026-11-02.

## Identity and directly observed canonical fields

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Manuel Roffo | GK → GK | 240796 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/manuel-roffo/240796) | `gkDiving` 74; `agility` 34; `strength` 46; `stamina` 17 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Roberto Fernández | GK → GK | 193241 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/roberto-fernandez/193241) | `gkDiving` 68; `agility` 58; `strength` 64; `stamina` 34 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Gustavo Velázquez | DF → CB | 246696 — [EA player page](https://careers.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/gustavo-velazquez/246696) | `strength` 81; `aggression` 75; `stamina` 72 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Blás Riveros | DF → LB | 233476 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/blas-riveros/233476) | `strength` 69; `aggression` 60; `stamina` 74 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Lucas Merolla | DF → CB | 232521 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lucas-merolla/232521) | `strength` 88; `aggression` 73; `stamina` 76 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Ignacio Aliseda | MF → LM | 246145 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ignacio-aliseda/246145) | `crossing` 63; `dribbling` 73 (leaf); `agility` 84; `stamina` 69 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Jonatan Torres | MF → ST **(discrepancy)** | 221955 — [EA player page](https://careers.ea.com/es/games/ea-sports-fc/ratings/player-ratings/jonatan-torres/221955) | `crossing` 47; `dribbling` 64 (leaf); `agility` 66; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Matías Pérez | MF → CB **(discrepancy)** | 255333 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matias-perez/255333) | `crossing` 36; `dribbling` 35 (leaf); `agility` 60; `stamina` 66 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Jorge Morel | MF → CDM | 253251 — [EA player page](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/jorge-morel/253251) | `crossing` 50; `dribbling` 54 (leaf); `agility` 64; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Juan Iturbe | FW → RW | 199151 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/juan-iturbe/199151) | `shootPower` 75; `dribbling` 76 (leaf); `agility` 80 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Pablo Vegetti | FW → ST | 217809 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pablo-vegetti/217809) | `shootPower` 78; `dribbling` 65 (leaf); `agility` 49 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Cecilio Domínguez | FW → LM **(discrepancy)** | 225878 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/cecilio-dominguez/225878) | `shootPower` 72; `dribbling` 76 (leaf); `agility` 78 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

Jonatan Torres's EA primary position ST and Matías Pérez's CB fall outside their ledger MF broad positions. Cecilio Domínguez's EA primary position LM falls outside his ledger FW broad position. These three cross-category discrepancies are recorded without changing roster assignments. The other nine EA primary positions fit their ledger broad GK, DF, MF or FW categories. The official EA team page lists all twelve names; their linked stable-ID individual pages identify the same-name player as belonging to Cerro Porteño.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved slots. No player has all six position inputs directly observed under the conservative matching rule. All 42 leaves are associated with stable IDs and names confirmed for the intended Cerro Porteño team. No EA group summary or OVR was copied into game data; no tier or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_11` ledger rows and twelve distinct `fc27_source_player_id` values; official EA FC 27 team and individual pages corroborate all names, IDs, and Cerro Porteño affiliation.
- Position accounting: 9 broad-position matches and 3 cross-category discrepancies (Jonatan Torres, Matías Pérez, Cecilio Domínguez).
- Identity/team conflicts: none; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 trusted direct leaves + 30 unresolved slots = 72.
- Ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: only this audit report was created; no data, backlog, or shared index files were edited.
