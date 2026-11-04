# Rating-tier source batch audit: Libertad (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_9` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using each row's stable `fc27_source_player_id`. EA's official [Libertad FC 27 team ratings list](https://www.ea.com/es/games/ea-sports-fc/ratings/teams-ratings/libertad/111008) and the stable-ID FC 27 individual player pages were checked for names, identities, positions, and club affiliation. All twelve audited players appear for Libertad on the FC 27 team list and all twelve individual pages identify the same-name player as a Libertad player. No identity or team conflicts were found. No roster, ledger, game, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA's FC 27 pages describe launch Gold, Silver and Bronze Ultimate Team items; they exclude other item types and later live-form updates. Sources checked on 2026-11-02.

## Identity and directly observed canonical fields

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Rodrigo Morínigo | GK → GK | 256156 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rodrigo-morinigo/256156) | `gkDiving` 68; `agility` 42; `strength` 48; `stamina` 30 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Ángel González | GK → GK | 261703 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/angel-gonzalez/261703) | `gkDiving` 64; `agility` 25; `strength` 58; `stamina` 28 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Matías Espinoza | DF → LB | 253239 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matias-espinoza/253239) | `strength` 68; `aggression` 52; `stamina` 85 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Álvaro Campuzano | DF → CDM **(discrepancy)** | 259410 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alvaro-campuzano/259410) | `strength` 86; `aggression` 75; `stamina` 85 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Robert Rojas | DF → RB | 246914 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/robert-rojas/246914) | `strength` 75; `aggression` 69; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Federico Carrizo | MF → CAM | 216055 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/federico-carrizo/216055) | `crossing` 69; `dribbling` 72 (leaf); `agility` 82; `stamina` 73 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lucas Sanabria | MF → CM | 255436 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lucas-sanabria/255436) | `crossing` 64; `dribbling` 71 (leaf); `agility` 66; `stamina` 67 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Iván Franco | MF → RM | 253240 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ivan-franco/253240) | `crossing` 60; `dribbling` 70 (leaf); `agility` 77; `stamina` 52 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Hernesto Caballero | MF → CDM | 248868 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hernesto-caballero/248868) | `crossing` 42; `dribbling` 63 (leaf); `agility` 52; `stamina` 53 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lorenzo Melgarejo | FW → ST | 204699 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lorenzo-melgarejo/204699) | `shootPower` 84; `dribbling` 74 (leaf); `agility` 72 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Matías Rojas | FW → RW | 237183 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matias-rojas/237183) | `shootPower` 79; `dribbling` 75 (leaf); `agility` 74 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Hugo Fernández | FW → LM **(discrepancy)** | 248869 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hugo-fernandez/248869) | `shootPower` 66; `dribbling` 68 (leaf); `agility` 73 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

Álvaro Campuzano's EA primary position CDM falls outside the ledger DF broad role, and Hugo Fernández's EA primary position LM falls outside the ledger FW broad role. These two cross-category discrepancies are recorded without changing roster assignments. The other ten EA primary positions fit their ledger broad GK, DF, MF or FW categories. The official EA Libertad team list includes all twelve audited names, and their linked individual pages use each ledger stable source ID and identify the same-name player as belonging to Libertad.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved slots. No player has all six position inputs directly observed under the conservative matching rule. All 42 leaves are associated with IDs and names confirmed for the intended Libertad team. No EA group summary or OVR was copied into game data; no tier or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_9` ledger rows and twelve distinct `fc27_source_player_id` values; official EA FC 27 team and individual pages corroborate all names, IDs, and Libertad affiliation.
- Position accounting: 10 broad-position matches and 2 cross-category discrepancies (Álvaro Campuzano and Hugo Fernández).
- Identity/team conflicts: none; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 trusted direct leaves + 30 unresolved slots = 72.
- Ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: only this audit report was created; no data, backlog, or shared index files were edited.
