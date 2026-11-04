# Rating-tier source batch audit: Viking FK (12 players)

**Audit date:** 2026-11-02
**Scope:** Read-only audit of exactly the twelve `cont_uefa_34` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by each row's explicit FC 27 source-player ID. EA's official [FC 27 Viking FK ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/viking-fk/300) includes all twelve audited names. All twelve stable IDs resolve to same-name players whose official individual pages identify Viking FK. No identity or team conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Ľubomír Belko | GK → GK | 83626 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lubomir-belko/83626) | `gkDiving` 66; `agility` 51; `strength` 65; `stamina` 27 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Arild Østbø | GK → GK | 186508 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/arild-stb/186508) | `gkDiving` 65; `agility` 57; `strength` 65; `stamina` 28 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Kristoffer Haugen | DF → LB | 209335 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kristoffer-haugen/209335) | `strength` 73; `aggression` 60; `stamina` 86 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Gianni Stensness | DF → CB | 247754 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gianni-stensness/247754) | `strength` 83; `aggression` 73; `stamina` 83 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Henrik Falchener | DF → CB | 256435 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/henrik-falchener/256435) | `strength` 89; `aggression` 66; `stamina` 84 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Joe Bell | MF → CDM | 254142 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joe-bell/254142) | `crossing` 66; `dribbling` 65 (leaf); `agility` 73; `stamina` 88 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Henrik Heggheim | MF → RB **(discrepancy)** | 257072 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/henrik-heggheim/257072) | `crossing` 60; `dribbling` 59 (leaf); `agility` 64; `stamina` 83 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Kristoffer Askildsen | MF → CM | 246100 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kristoffer-askildsen/246100) | `crossing` 63; `dribbling` 67 (leaf); `agility` 66; `stamina` 85 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Simen Kvia-Egeskog | MF → CM | 262860 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/simen-kvia-egeskog/262860) | `crossing` 55; `dribbling` 71 (leaf); `agility` 86; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Zlatko Tripić | FW → RM **(discrepancy)** | 205214 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/zlatko-tripic/205214) | `shootPower` 80; `dribbling` 75 (leaf); `agility` 78 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Peter Buch Christiansen | FW → ST | 245384 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/peter-buch-christiansen/245384) | `shootPower` 73; `dribbling` 69 (leaf); `agility` 84 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Edvin Austbø | FW → LM **(discrepancy)** | 271265 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/edvin-austb/271265) | `shootPower` 69; `dribbling` 74 (leaf); `agility` 87 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Henrik Heggheim is stored as ledger `MF`, while EA lists his primary position as `RB`, outside the ledger's broad MF group. Zlatko Tripić is stored as ledger `FW`, while EA lists his primary position as `RM`, outside the ledger's broad FW group. Edvin Austbø is stored as ledger `FW`, while EA lists his primary position as `LM`, outside the ledger's broad FW group. The other nine EA primary positions fit their ledger broad categories. The official Viking FK team list includes all twelve audited names, and each individual page resolves to the same-name Viking FK player. No identity or club conflict was observed.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_34` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's Viking FK team list includes all twelve and individual pages corroborate same-name identity and team affiliation.
- Position accounting: 9 broad-position matches and 3 discrepancies (Henrik Heggheim: ledger MF, EA RB; Zlatko Tripić: ledger FW, EA RM; Edvin Austbø: ledger FW, EA LM).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
