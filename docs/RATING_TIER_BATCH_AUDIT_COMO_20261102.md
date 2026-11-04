# Rating-tier source batch audit: Como (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_uefa_9` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using each row's stable FC 27 source-player ID. EA's official [Como FC 27 team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/como/1745) and all twelve individual player pages were checked for names, identities, primary positions, and Como affiliation. All twelve pages resolve to the ledger's same-name player and identify Como as the team. No identity or team conflicts were found. No roster, ledger, game, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items and exclude other item types and later live-form updates in other modes; EA also notes club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Emil Audero | GK → GK | 228413 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/emil-audero/228413) | `gkDiving` 81; `agility` 53; `strength` 55; `stamina` 25 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Jean Butez | GK → GK | 225149 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jean-butez/225149) | `gkDiving` 74; `agility` 37; `strength` 64; `stamina` 42 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Trevoh Chalobah | DF → CB | 230918 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/trevoh-chalobah/230918) | `strength` 83; `aggression` 76; `stamina` 67 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Yan Couto | DF → RB | 259075 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yan-couto/259075) | `strength` 51; `aggression` 66; `stamina` 72 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Jacobo Ramón | DF → CB | 70966 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jacobo-ramon/70966) | `strength` 77; `aggression` 68; `stamina` 66 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Luis Milla | MF → CM | 242201 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luis-milla/242201) | `crossing` 88; `dribbling` 77 (leaf); `agility` 68; `stamina` 90 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lucas Da Cunha | MF → CDM | 254579 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lucas-da-cunha/254579) | `crossing` 70; `dribbling` 80 (leaf); `agility` 83; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Maxence Caqueret | MF → CDM | 246646 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/maxence-caqueret/246646) | `crossing` 69; `dribbling` 79 (leaf); `agility` 85; `stamina` 70 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Máximo Perrone | MF → CDM | 267991 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/maximo-perrone/267991) | `crossing` 49; `dribbling` 76 (leaf); `agility` 74; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Nico Paz | FW → CAM **(discrepancy)** | 277846 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nico-paz/277846) | `shootPower` 73; `dribbling` 86 (leaf); `agility` 80 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Martin Baturina | FW → CAM **(discrepancy)** | 262842 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/martin-baturina/262842) | `shootPower` 75; `dribbling` 84 (leaf); `agility` 78 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Morata | FW → ST | 201153 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/morata/201153) | `shootPower` 80; `dribbling` 76 (leaf); `agility` 76 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

Nico Paz and Martin Baturina are both stored as ledger `FW` players, while EA gives each the primary position `CAM`, outside the ledger's broad FW group. Those discrepancies are recorded without changing roster assignments. The other ten EA primary positions fit their ledger broad GK, DF, MF or FW categories. The official Como team list includes all twelve audited names, and each individual page confirms the same player identity and Como affiliation.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved slots. No player has all six position inputs directly observed under the conservative matching rule. No EA group summary or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_9` ledger rows, twelve distinct canonical player IDs, and twelve distinct EA source IDs; all twelve individual pages match the ledger identity and Como affiliation.
- Position accounting: 10 broad-position matches and 2 discrepancies (Nico Paz and Martin Baturina).
- Identity/team conflicts: none; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 trusted direct leaves + 30 unresolved fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: only this dated audit report was created; roster data, source ledger, shared index, and backlog were not edited.
