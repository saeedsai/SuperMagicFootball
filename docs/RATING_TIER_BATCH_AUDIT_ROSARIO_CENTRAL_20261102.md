# Rating-tier source batch audit: Rosario Central (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_18` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. EA's official [FC 27 Rosario Central ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/rosario-central/110580) includes all twelve audited names and their IDs. Each official individual FC 27 profile resolves to the same-name Rosario Central player. No identity or team conflicts were observed. No player, roster, ledger, tier, or verification data were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling,” not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver, and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note that club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Conan Ledesma | GK → GK | 219522 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/conan-ledesma/219522) | `gkDiving` 77; `agility` 48; `strength` 77; `stamina` 41 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Axel Werner | GK → GK | 215213 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/axel-werner/215213) | `gkDiving` 71; `agility` 34; `strength` 75; `stamina` 38 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Franco Ibarra | DF → CDM **(discrepancy)** | 254695 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/franco-ibarra/254695) | `strength` 78; `aggression` 73; `stamina` 92 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Facundo Mallo | DF → CB | 248207 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/facundo-mallo/248207) | `strength` 83; `aggression` 79; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Agustín Sández | DF → LB | 263518 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/agustin-sandez/263518) | `strength` 85; `aggression` 81; `stamina` 83 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Federico Navarro | MF → CDM | 246335 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/federico-navarro/246335) | `crossing` 56; `dribbling` 69 (leaf); `agility` 77; `stamina` 76 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Pol Fernández | MF → CM | 211269 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pol-fernandez/211269) | `crossing` 65; `dribbling` 72 (leaf); `agility` 74; `stamina` 71 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Vicente Pizarro | MF → CDM | 256441 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/vicente-pizarro/256441) | `crossing` 53; `dribbling` 70 (leaf); `agility` 75; `stamina` 83 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Emanuel Coronel | MF → RB **(discrepancy)** | 242482 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/emanuel-coronel/242482) | `crossing` 68; `dribbling` 49 (leaf); `agility` 70; `stamina` 74 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Ángel Di María | FW → RW | 183898 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/angel-di-maria/183898) | `shootPower` 81; `dribbling` 85 (leaf); `agility` 83 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Jaminton Campaz | FW → LM **(discrepancy)** | 238230 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jaminton-campaz/238230) | `shootPower` 76; `dribbling` 78 (leaf); `agility` 77 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Enzo Copetti | FW → ST | 238332 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/enzo-copetti/238332) | `shootPower` 75; `dribbling` 69 (leaf); `agility` 66 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Franco Ibarra is stored as ledger `DF`, while EA lists `CDM`, outside the ledger's broad DF group. Emanuel Coronel is stored as `MF`, while EA lists `RB`, outside the broad MF group. Jaminton Campaz is stored as `FW`, while EA lists `LM`, outside the broad FW group. The other nine EA primary positions fit their ledger broad categories. EA's Rosario Central team list includes every audited name and corresponding ID; each individual page corroborates the same identity and Rosario Central affiliation. No identity/team conflicts were observed; no conflicted field observations were excluded.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_18` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's official Rosario Central list includes all twelve and individual pages corroborate same-name identity and club affiliation.
- Position accounting: 9 broad-position matches and 3 discrepancies (Franco Ibarra: DF/CDM; Emanuel Coronel: MF/RB; Jaminton Campaz: FW/LM).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
