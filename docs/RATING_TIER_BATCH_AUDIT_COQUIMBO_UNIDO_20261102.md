# Rating-tier source batch audit: Coquimbo Unido (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_21` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by each row's explicit FC 27 source-player ID. EA's [official FC 27 Coquimbo Unido ratings list](https://www.ea.com/es/games/ea-sports-fc/ratings/teams-ratings/coquimbo-unido/112705) lists all twelve audited names. Eleven direct individual FC 27 pages were successfully checked for same-name identity, position, club, and attributes. Diego Sánchez (ID 214703) is listed on the current team page and an EA FC 27 search result identifies him as a Coquimbo Unido goalkeeper, but the retrievable EA individual URL resolved to FC 25 and the current FC 27 profile could not be opened reliably. Diego's individual field observations are therefore excluded; no FC 25 values are used. No roster, ledger, tier, verification, or game data were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. FC 27 pages reflect launch Gold, Silver, and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was counted for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Diego Sánchez | GK → GK* | 214703 — [EA FC 27 profile search result](https://careers.ea.com/nb/games/ea-sports-fc/ratings/player-ratings/diego-sanchez/214703); [EA Coquimbo Unido list](https://www.ea.com/es/games/ea-sports-fc/ratings/teams-ratings/coquimbo-unido/112705) | — (no individual leaves counted) | `gkDiving`, `gkSkill`, `agility`, `strength`, `stamina`, `passing` (FC 27 profile content could not be verified; FC 25 page excluded) |
| Gonzalo Flores | GK → GK | 76301 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/gonzalo-flores/76301) | `gkDiving` 61; `agility` 32; `strength` 57; `stamina` 18 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Juan Cornejo | DF → LB | 213591 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/juan-cornejo/213591) | `strength` 76; `aggression` 61; `stamina` 74 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Benjamín Gazzolo | DF → CB | 254989 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/benjamin-gazzolo/254989) | `strength` 79; `aggression` 60; `stamina` 66 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Manuel Fernández | DF → CB | 238837 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/manuel-fernandez/238837) | `strength` 80; `aggression` 73; `stamina` 65 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Alejandro Camargo | MF → CM | 229201 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/alejandro-camargo/229201) | `crossing` 63; `dribbling` 63 (leaf); `agility` 68; `stamina` 83 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Francisco Salinas | MF → RB **(discrepancy)** | 71443 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/francisco-salinas/71443) | `crossing` 64; `dribbling` 66 (leaf); `agility` 67; `stamina` 72 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Sebastián Galani | MF → CDM | 248257 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/sebastian-galani/248257) | `crossing` 49; `dribbling` 56 (leaf); `agility` 55; `stamina` 74 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Luis Riveros | MF → RW **(discrepancy)** | 238815 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/luis-riveros/238815) | `crossing` 58; `dribbling` 64 (leaf); `agility` 69; `stamina` 69 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lucas Pratto | FW → ST | 184252 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/lucas-pratto/184252) | `shootPower` 70; `dribbling` 66 (leaf); `agility` 50 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Guido Vadalá | FW → CAM | 221661 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/guido-vadala/221661) | `shootPower` 62; `dribbling` 73 (leaf); `agility` 85 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Cristián Zavala | FW → RW | 248258 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/cristian-zavala/248258) | `shootPower` 61; `dribbling` 67 (leaf); `agility` 77 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

\*The current FC 27 team table lists Diego Sánchez at GK and an EA FC 27 profile-search result for ID 214703 names him as Coquimbo Unido's goalkeeper. However, the individually retrievable `ea.com` regional profile for that ID is titled FC 25, while the current `careers.ea.com` FC 27 profile timed out on retrieval. The team listing and search result are sufficient to record the candidate identity and position, but not individual FC 27 leaves; all six canonical fields for Diego remain unobserved. The FC 25 values were deliberately not substituted.

## Position check and result

Ten rows fit the ledger's broad-position categories. Francisco Salinas is stored as ledger `MF` while EA lists him at `RB`; Luis Riveros is stored as `MF` while EA lists him at `RW`. Diego's FC 27 team listing and current-profile search result both show `GK`; individual fields remain unverified as described above. No name or team conflict was observed for the other eleven directly checked FC 27 player pages.

The directly observed individual pages expose **38 of 72** canonical-field leaves, leaving **34** unresolved. By ledger group, direct/unresolved counts are GK 4/8, DF 9/9, MF 16/8, and FW 9/9. Diego accounts for six unresolved GK fields because the current FC 27 individual data could not be retrieved; the available FC 25 page is excluded. No EA group summary, headline rating, or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_21` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs. The official Coquimbo Unido team ratings list contains all twelve audited names. Eleven current individual profile pages corroborate the same-name identity and club. Diego is separately marked unresolved at individual-field level due to the retrievable-profile version inconsistency.
- Position accounting: 10 broad-position matches and 2 discrepancies (Francisco Salinas: MF→RB; Luis Riveros: MF→RW).
- Field accounting: 38 directly observed FC 27 individual leaves + 34 unresolved canonical fields = 72; Diego's six leaves were excluded.
- Diego source handling: current EA FC 27 team listing and search evidence identify Coquimbo Unido / GK for ID 214703; the retrievable EA regional individual URL returned an FC 25 profile, and the current EA Careers profile could not be fetched. Zero FC 25 leaves were counted.
- Identity/team conflicts among the other eleven FC 27 profiles: none observed; no conflicted leaves were counted.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index, and backlog were not edited.
