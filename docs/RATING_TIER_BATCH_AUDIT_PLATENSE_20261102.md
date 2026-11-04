# Rating-tier source batch audit: Platense (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_25` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by each row's explicit FC 27 source-player ID. EA's [official FC 27 Platense ratings list](https://careers.ea.com/games/ea-sports-fc/ratings/teams-ratings/platense/112689) lists all twelve audited names and links to their player-ID pages. Eleven individual FC 27 pages corroborate the matching name and Platense club. Gastón Togni's ledger ID page (237512) currently identifies him as a Peñarol player, creating a club conflict with the Platense list; his six attribute leaves are excluded from team-trusted coverage. No roster, ledger, tier, verification, or game data were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. FC 27 pages reflect launch Gold, Silver, and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was counted for that canonical field. Position discrepancies and club conflicts are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Juan Pablo Cozzani | GK → GK | 246610 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/juan-pablo-cozzani/246610) | `gkDiving` 72; `agility` 49; `strength` 51; `stamina` 38 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Brian Bustos | GK → GK | 76483 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/brian-bustos/76483) | `gkDiving` 66; `agility` 65; `strength` 36; `stamina` 28 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Ignacio Vázquez | DF → CB | 264365 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/ignacio-vazquez/264365) | `strength` 84; `aggression` 76; `stamina` 76 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Víctor Cuesta | DF → CB | 215054 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/victor-cuesta/215054) | `strength` 84; `aggression` 78; `stamina` 76 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Gastón Togni | DF → LM **(position and club discrepancy)** | 237512 — [EA player page](https://careers.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/gaston-togni/237512); [EA Platense list](https://careers.ea.com/games/ea-sports-fc/ratings/teams-ratings/platense/112689) | — (all leaves excluded because the individual FC 27 page assigns him to Peñarol, not Platense) | All six ledger canonical fields: `defence`, `speedRating`, `heading`, `strength`, `aggression`, `stamina` (club conflict; no team-trusted values counted) |
| Bautista Merlini | MF → CAM | 233372 — [EA player page](https://careers.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/bautista-merlini/233372) | `crossing` 61; `dribbling` 68 (leaf); `agility` 85; `stamina` 77 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Guido Mainero | MF → RM | 242002 — [EA player page](https://careers.ea.com/ar/games/ea-sports-fc/ratings/player-ratings/guido-mainero/242002) | `crossing` 70; `dribbling` 72 (leaf); `agility` 85; `stamina` 78 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Iván Gómez | MF → CM | 235987 — [EA player page](https://careers.ea.com/cs/games/ea-sports-fc/ratings/player-ratings/ivan-gomez/235987) | `crossing` 49; `dribbling` 70 (leaf); `agility` 71; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Maximiliano Amarfil | MF → CM | 76488 — [EA player page](https://careers.ea.com/sv/games/ea-sports-fc/ratings/player-ratings/maximiliano-amarfil/76488) | `crossing` 53; `dribbling` 73 (leaf); `agility` 67; `stamina` 69 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Nicolás López | FW → ST | 207715 — [EA player page](https://careers.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/nicolas-lopez/207715) | `shootPower` 79; `dribbling` 82 (leaf); `agility` 77 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Franco Zapiola | FW → LM **(position discrepancy)** | 263502 — [EA player page](https://careers.ea.com/es/games/ea-sports-fc/ratings/player-ratings/franco-zapiola/263502) | `shootPower` 66; `dribbling` 73 (leaf); `agility` 68 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Augusto Lotti | FW → ST | 242019 — [EA player page](https://careers.ea.com/pt-br/games/ea-sports-fc/ratings/player-ratings/augusto-lotti/242019) | `shootPower` 72; `dribbling` 66 (leaf); `agility` 69 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position and club checks

Ten rows fit the ledger's broad-position categories. Gastón Togni is stored as `DF` but EA lists `LM`; Franco Zapiola is stored as `FW` but EA lists `LM`. EA's official Platense list includes all twelve names, and the twelve listed EA links carry the exact source IDs recorded by the ledger. Eleven individual FC 27 profiles identify the player at Platense. Togni's current individual EA FC 27 profile identifies him at Peñarol, conflicting with the Platense team list. His same-name profile and ID are recorded, but none of his individual leaves count toward Platense team-trusted coverage. This report does not infer which club listing is erroneous or change roster membership.

The directly observed, team-trusted individual pages expose **39 of 72** canonical-field leaves, leaving **33** unresolved. By ledger group, direct/unresolved counts are GK 8/4, DF 6/12, MF 16/8, and FW 9/9. The six fields for Togni are excluded due to the club conflict. No EA group summary, headline rating, or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_25` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs. The official EA Platense list includes all twelve audited names and its individual links resolve to the matching IDs.
- Position accounting: 10 broad-position matches and 2 discrepancies (Gastón Togni: DF→LM; Franco Zapiola: FW→LM).
- Identity/team checks: eleven same-name FC 27 profile pages identify Platense. Gastón Togni's same-name FC 27 page identifies Peñarol; all six fields are excluded from trusted coverage due to this conflict.
- Field accounting: 39 directly observed team-trusted FC 27 individual leaves + 33 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index, and backlog were not edited.
