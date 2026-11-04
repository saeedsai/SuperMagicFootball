# Rating-tier source batch audit: LAFC (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_concacaf_22` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. EA's official [FC 27 LAFC ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/lafc/112996) includes all twelve audited names and their IDs. Each official English individual page resolves to the same-name LAFC player in FC 27. No identity or team conflicts were observed. No player, roster, ledger, tier, or verification data were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling,” not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver, and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note that club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Hugo Lloris | GK → GK | 167948 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hugo-lloris/167948) | `gkDiving` 74; `agility` 49; `strength` 39; `stamina` 31 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Thomas Hasal | GK → GK | 248216 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/thomas-hasal/248216) | `gkDiving` 60; `agility` 23; `strength` 63; `stamina` 23 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Ryan Hollingshead | DF → LB | 221488 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ryan-hollingshead/221488) | `strength` 81; `aggression` 74; `stamina` 86 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Ryan Porteous | DF → CB | 240439 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ryan-porteous/240439) | `strength` 81; `aggression` 84; `stamina` 74 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Aaron Long | DF → CB | 222123 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/aaron-long/222123) | `strength` 80; `aggression` 71; `stamina` 79 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Mark Delgado | MF → CDM | 208592 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mark-delgado/208592) | `crossing` 67; `dribbling` 67 (leaf); `agility` 75; `stamina` 88 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Timothy Tillman | MF → CM | 240319 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/timothy-tillman/240319) | `crossing` 56; `dribbling` 77 (leaf); `agility` 74; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| David Martínez | MF → RW **(discrepancy)** | 272317 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/david-martinez/272317) | `crossing` 59; `dribbling` 79 (leaf); `agility` 81; `stamina` 61 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Eddie Segura | MF → CB **(discrepancy)** | 237245 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/eddie-segura/237245) | `crossing` 23; `dribbling` 49 (leaf); `agility` 61; `stamina` 71 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Son Heung Min | FW → ST | 200104 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/son-heung-min/200104) | `shootPower` 85; `dribbling` 83 (leaf); `agility` 80 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Denis Bouanga | FW → LW | 225951 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/denis-bouanga/225951) | `shootPower` 85; `dribbling` 83 (leaf); `agility` 85 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Armindo Sieb | FW → ST | 259162 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/armindo-sieb/259162) | `shootPower` 72; `dribbling` 77 (leaf); `agility` 82 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

David Martínez is stored as ledger `MF`, while EA lists his primary position as `RW`, outside the ledger's broad MF group. Eddie Segura is stored as `MF`, while EA lists his primary position as `CB`, also outside the ledger's broad MF group. The other ten EA primary positions fit their ledger broad categories. EA's LAFC team list includes all twelve names and corresponding IDs; each individual page corroborates the same identity and LAFC affiliation. No identity/team conflicts were observed; no conflicted field observations were excluded.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_concacaf_22` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's official LAFC list includes all twelve and individual pages corroborate same-name identity and club affiliation.
- Position accounting: 10 broad-position matches and 2 discrepancies (David Martínez: MF/RW; Eddie Segura: MF/CB).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
