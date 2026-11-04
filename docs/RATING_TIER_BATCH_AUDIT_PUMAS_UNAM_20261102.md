# Rating-tier source batch audit: Pumas UNAM (12 players)

**Audit date:** 2026-11-02
**Scope:** Read-only audit of exactly the twelve `cont_concacaf_18` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by each row's explicit FC 27 source-player ID. EA names this club Pumas; its official [FC 27 Pumas ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/pumas/1881) includes all twelve audited names. All twelve stable IDs resolve to same-name players whose individual EA pages identify Pumas. No identity or team conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Keylor Navas | GK → GK | 193041 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/keylor-navas/193041) | `gkDiving` 80; `agility` 60; `strength` 75; `stamina` 39 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Pablo Lara | GK → GK | 70719 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pablo-lara/70719) | `gkDiving` 67; `agility` 34; `strength` 43; `stamina` 28 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Álvaro Angulo | DF → LB | 228156 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alvaro-angulo/228156) | `strength` 59; `aggression` 62; `stamina` 91 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Rubén Duarte | DF → LB | 226637 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ruben-duarte/226637) | `strength` 71; `aggression` 73; `stamina` 65 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Nathan Silva | DF → CB | 264840 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nathan-silva/264840) | `strength` 83; `aggression` 71; `stamina` 56 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Pedro Vite | MF → CM | 261222 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pedro-vite/261222) | `crossing` 69; `dribbling` 70 (leaf); `agility` 85; `stamina` 91 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Adalberto Carrasquilla | MF → CM | 243544 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/adalberto-carrasquilla/243544) | `crossing` 64; `dribbling` 72 (leaf); `agility` 84; `stamina` 82 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Alan Medina | MF → RM | 239629 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alan-medina/239629) | `crossing` 66; `dribbling` 74 (leaf); `agility` 72; `stamina` 71 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Uriel Antuna | MF → RW **(discrepancy)** | 237997 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/uriel-antuna/237997) | `crossing` 58; `dribbling` 73 (leaf); `agility` 87; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Guillermo Martínez | FW → ST | 221293 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/guillermo-martinez/221293) | `shootPower` 80; `dribbling` 57 (leaf); `agility` 58 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Juninho Vieira | FW → ST | 235371 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/juninho-vieira/235371) | `shootPower` 77; `dribbling` 68 (leaf); `agility` 75 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Robert Morales | FW → ST | 260139 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/robert-morales/260139) | `shootPower` 74; `dribbling` 67 (leaf); `agility` 73 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Uriel Antuna is stored as ledger `MF`, while EA lists his primary position as `RW`, outside the ledger's broad MF group. The other eleven EA primary positions fit their ledger broad categories. EA's Pumas list includes all twelve audited names, and each individual page resolves to the same-name Pumas player. No identity or club conflict was observed.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_concacaf_18` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's Pumas team list includes all twelve and individual pages corroborate same-name identity and team affiliation.
- Position accounting: 11 broad-position matches and 1 discrepancy (Uriel Antuna: ledger MF, EA RW).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
