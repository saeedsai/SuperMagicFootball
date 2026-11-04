# Rating-tier source batch audit: Feyenoord (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_uefa_11` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using each row's stable FC 27 source-player ID. The official [EA SPORTS FC 27 Feyenoord ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/feyenoord/246) and all twelve linked stable-ID player pages were checked for names, identities, primary positions, and Feyenoord affiliation. All twelve individual pages identify the listed same-name player as a Feyenoord player. No identity or team conflicts were found. No roster, ledger, game, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items and exclude other item types and later live-form updates in other modes; EA also notes club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Tjark Ernst | GK → GK | 262931 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/tjark-ernst/262931) | `gkDiving` 77; `agility` 28; `strength` 55; `stamina` 26 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Liam Bossin | GK → GK | 229114 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/liam-bossin/229114) | `gkDiving` 66; `agility` 37; `strength` 69; `stamina` 26 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Tsuyoshi Watanabe | DF → CB | 246826 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/tsuyoshi-watanabe/246826) | `strength` 82; `aggression` 72; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Givairo Read | DF → RB | 271266 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/givairo-read/271266) | `strength` 75; `aggression` 74; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Jordan Bos | DF → LB | 260521 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jordan-bos/260521) | `strength` 81; `aggression` 73; `stamina` 83 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Luciano Valente | MF → CM | 262221 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luciano-valente/262221) | `crossing` 75; `dribbling` 79 (leaf); `agility` 77; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Sem Steijn | MF → CAM | 244728 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sem-steijn/244728) | `crossing` 68; `dribbling` 74 (leaf); `agility` 72; `stamina` 72 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Oussama Targhalline | MF → CDM | 263603 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/oussama-targhalline/263603) | `crossing` 60; `dribbling` 77 (leaf); `agility` 76; `stamina` 78 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Charles Vanhoutte | MF → CDM | 244889 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/charles-vanhoutte/244889) | `crossing` 72; `dribbling` 70 (leaf); `agility` 68; `stamina` 85 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Ayase Ueda | FW → ST | 252162 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ayase-ueda/252162) | `shootPower` 80; `dribbling` 69 (leaf); `agility` 76 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Anis Hadj Moussa | FW → RW | 70726 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/anis-hadj-moussa/70726) | `shootPower` 72; `dribbling` 87 (leaf); `agility` 92 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Casper Tengstedt | FW → ST | 257920 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/casper-tengstedt/257920) | `shootPower` 72; `dribbling` 69 (leaf); `agility` 70 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

All twelve EA primary positions fall within the ledger's broad GK, DF, MF or FW grouping. No broad-position discrepancy, identity conflict, or team conflict was found. The individual EA pages show Feyenoord as each player's team.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved slots. No player has all six position inputs directly observed under the conservative matching rule. No EA group summary or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_11` ledger rows, twelve distinct canonical player IDs, and twelve distinct EA source IDs; all 12 individual pages match the ledger name and show Feyenoord affiliation.
- Position accounting: 12 broad-position matches and 0 discrepancies.
- Identity/team conflicts: none; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 trusted direct leaves + 30 unresolved fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: only this dated audit report was created; roster data, source ledger, shared index, and backlog were not edited.
