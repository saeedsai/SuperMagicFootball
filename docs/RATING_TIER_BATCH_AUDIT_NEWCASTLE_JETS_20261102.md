# Rating-tier source batch audit: Newcastle Jets (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_afc_28` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. EA's official [FC 27 Newcastle Jets ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/newcastle-jets/111398) includes all twelve audited names and their IDs. Each individual EA FC 27 profile resolves to the same-name Newcastle Jets player. No identity or team conflicts were observed. No player, roster, ledger, tier, or verification data were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling,” not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver, and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note that club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| James Delianov | GK → GK | 239019 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/james-delianov/239019) | `gkDiving` 62; `agility` 32; `strength` 63; `stamina` 30 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Alex Nassiep | GK → GK | 76682 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alex-nassiep/76682) | `gkDiving` 52; `agility` 39; `strength` 60; `stamina` 19 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Alex Grant | DF → CB | 209210 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alex-grant/209210) | `strength` 93; `aggression` 70; `stamina` 74 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Joe Shaughnessy | DF → CB | 198624 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joe-shaughnessy/198624) | `strength` 70; `aggression` 65; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Daniel Wilmering | DF → LB | 247836 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/daniel-wilmering/247836) | `strength` 61; `aggression` 58; `stamina` 76 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Max Burgess | MF → CDM | 225757 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/max-burgess/225757) | `crossing` 57; `dribbling` 63 (leaf); `agility` 67; `stamina` 78 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Thomas Aquilina | MF → RM | 259767 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/thomas-aquilina/259767) | `crossing` 59; `dribbling` 61 (leaf); `agility` 87; `stamina` 91 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Alex Badolato | MF → CM | 264063 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alex-badolato/264063) | `crossing` 41; `dribbling` 65 (leaf); `agility` 72; `stamina` 60 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Will Dobson | MF → CM | 74614 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/will-dobson/74614) | `crossing` 48; `dribbling` 60 (leaf); `agility` 65; `stamina` 55 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Joe Lolley | FW → RM **(discrepancy)** | 221587 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joe-lolley/221587) | `shootPower` 71; `dribbling` 70 (leaf); `agility` 86 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Zach Clough | FW → RM **(discrepancy)** | 212803 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/zach-clough/212803) | `shootPower` 63; `dribbling` 65 (leaf); `agility` 85 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Nikolaos Vergos | FW → ST | 222540 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nikolaos-vergos/222540) | `shootPower` 69; `dribbling` 59 (leaf); `agility` 68 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Joe Lolley and Zach Clough are stored as ledger `FW`, while EA lists each as `RM`, outside the ledger's broad FW group. The other ten EA primary positions fit their ledger broad categories. EA's Newcastle Jets team list includes all twelve names and corresponding IDs; each individual EA FC 27 page corroborates same-name identity and Newcastle Jets affiliation. No identity/team conflicts were observed; no conflicted field observations were excluded.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_afc_28` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's official Newcastle Jets list includes all twelve and individual pages corroborate same-name identity and club affiliation.
- Position accounting: 10 broad-position matches and 2 discrepancies (Joe Lolley: FW/RM; Zach Clough: FW/RM).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
