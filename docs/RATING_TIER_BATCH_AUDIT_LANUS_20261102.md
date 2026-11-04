# Rating-tier source batch audit: Lanús (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_8` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using each row's stable `fc27_source_player_id`. EA's official [Lanús FC 27 team ratings list](https://www.ea.com/es/games/ea-sports-fc/ratings/teams-ratings/lanus/110395) and the corresponding stable-ID FC 27 individual pages were checked for identity, position, and club affiliation. All twelve IDs resolve to the same-name Lanús players; there were no team or identity conflicts. No roster, ledger, game, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA's FC 27 pages describe launch Gold, Silver and Bronze Ultimate Team items; they exclude other item types and later live-form updates. Sources checked on 2026-11-02.

## Identity and directly observed canonical fields

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Nahuel Losada | GK → GK | 222418 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nahuel-losada/222418) | `gkDiving` 77; `agility` 49; `strength` 76; `stamina` 38 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Franco Petroli | GK → GK | 256407 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/franco-petroli/256407) | `gkDiving` 71; `agility` 51; `strength` 78; `stamina` 38 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Ramiro Carrera | DF → LM **(discrepancy)** | 219174 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ramiro-carrera/219174) | `strength` 82; `aggression` 66; `stamina` 80 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Carlos Izquierdoz | DF → CB | 214766 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/carlos-izquierdoz/214766) | `strength` 85; `aggression` 80; `stamina` 78 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Sasha Marcich | DF → LB | 261262 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sasha-marcich/261262) | `strength` 73; `aggression` 78; `stamina` 76 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Agustín Cardozo | MF → CDM | 236472 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/agustin-cardozo/236472) | `crossing` 58; `dribbling` 73 (leaf); `agility` 65; `stamina` 76 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Felipe Peña Biafore | MF → CDM | 264323 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/felipe-pena-biafore/264323) | `crossing` 63; `dribbling` 60 (leaf); `agility` 67; `stamina` 69 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Franco Watson | MF → CAM | 272911 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/franco-watson/272911) | `crossing` 64; `dribbling` 67 (leaf); `agility` 60; `stamina` 45 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Matías Sepúlveda | MF → RM | 238320 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matias-sepulveda/238320) | `crossing` 71; `dribbling` 71 (leaf); `agility` 71; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Marcelino Moreno | FW → CAM **(discrepancy)** | 235467 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marcelino-moreno/235467) | `shootPower` 73; `dribbling` 83 (leaf); `agility` 86 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Eduardo Salvio | FW → RM **(discrepancy)** | 190972 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/eduardo-salvio/190972) | `shootPower` 77; `dribbling` 77 (leaf); `agility` 79 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Allan Wlk | FW → ST | 274858 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/allan-wlk/274858) | `shootPower` 72; `dribbling` 64 (leaf); `agility` 76 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

The EA primary positions for Ramiro Carrera (LM), Marcelino Moreno (CAM), and Eduardo Salvio (RM) fall outside their ledger broad positions (DF and FW respectively under this audit's broad GK/DF/MF/FW grouping). These three discrepancies are recorded without changing roster assignments. Matías Sepúlveda's EA primary position RM fits the ledger MF broad group, as do the other eight position matches. The official EA Lanús team list corroborates all twelve names; each linked individual page uses the corresponding stable source ID and identifies the player as Lanús.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved slots. No player has all six position inputs directly observed under the conservative matching rule. All 42 leaves are associated with IDs and names confirmed for the intended Lanús team. No EA group summary or OVR was copied into game data; no tier or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_8` ledger rows and twelve distinct `fc27_source_player_id` values; official EA team and individual pages corroborate all names, IDs, and Lanús affiliation.
- Position accounting: 9 broad-position matches and 3 cross-category discrepancies (Ramiro Carrera, Marcelino Moreno, Eduardo Salvio).
- Identity/team conflicts: none; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 trusted direct leaves + 30 unresolved slots = 72.
- Ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster, ledger, game, tier, backlog, or shared index data changed.
