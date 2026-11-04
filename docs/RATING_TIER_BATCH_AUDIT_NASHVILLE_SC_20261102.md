# Rating-tier source batch audit: Nashville SC (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_concacaf_26` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by each row's explicit FC 27 source-player ID. EA's [official FC 27 Nashville SC ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/nashville-sc/114162) contains all twelve audited names. Each official individual EA page corroborates the matching player name and Nashville SC affiliation. No identity or team conflicts were observed. No roster, ledger, tier, verification, or game data were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. FC 27 player pages reflect launch Gold, Silver, and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Brian Schwake | GK → GK | 261305 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/brian-schwake/261305) | `gkDiving` 70; `agility` 32; `strength` 71; `stamina` 25 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Joe Willis | GK → GK | 202215 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joe-willis/202215) | `gkDiving` 66; `agility` 52; `strength` 71; `stamina` 26 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Andy Nájar | DF → RB | 198705 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/andy-najar/198705) | `strength` 66; `aggression` 72; `stamina` 59 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Maxwell Woledzi | DF → CB | 251905 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/maxwell-woledzi/251905) | `strength` 83; `aggression` 76; `stamina` 78 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Daniel Lovitz | DF → LB | 221713 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/daniel-lovitz/221713) | `strength` 66; `aggression` 71; `stamina` 76 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Elias Saad | MF → LW **(discrepancy)** | 274000 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/elias-saad/274000) | `crossing` 64; `dribbling` 75 (leaf); `agility` 86; `stamina` 69 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Edvard Tagseth | MF → CDM | 252858 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/edvard-tagseth/252858) | `crossing` 60; `dribbling` 67 (leaf); `agility` 84; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Warren Madrigal | MF → LW **(discrepancy)** | 75070 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/warren-madrigal/75070) | `crossing` 58; `dribbling` 67 (leaf); `agility` 76; `stamina` 68 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Patrick Yazbek | MF → CDM | 261875 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/patrick-yazbek/261875) | `crossing` 60; `dribbling` 59 (leaf); `agility` 69; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Hany Mukhtar | FW → CAM **(discrepancy)** | 210021 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hany-mukhtar/210021) | `shootPower` 75; `dribbling` 78 (leaf); `agility` 87 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Sam Surridge | FW → ST | 234249 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sam-surridge/234249) | `shootPower` 78; `dribbling` 70 (leaf); `agility` 63 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Cristian Espinoza | FW → RM **(discrepancy)** | 226385 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/cristian-espinoza/226385) | `shootPower` 74; `dribbling` 78 (leaf); `agility` 81 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Elias Saad and Warren Madrigal are stored as ledger `MF`, while EA lists them as `LW`; Hany Mukhtar is stored as `FW`, while EA lists him as `CAM`; and Cristian Espinoza is stored as `FW`, while EA lists him as `RM`. The other eight EA primary positions fit their ledger broad categories. The official Nashville SC list and all twelve same-name individual profiles support the player/team matches; no identity or club conflicts were observed.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By ledger group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating, or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_concacaf_26` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's Nashville SC list includes all twelve and each individual profile corroborates the same-name identity and club.
- Position accounting: 8 broad-position matches and 4 discrepancies (Elias Saad: MF→LW; Warren Madrigal: MF→LW; Hany Mukhtar: FW→CAM; Cristian Espinoza: FW→RM).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index, and backlog were not edited.
