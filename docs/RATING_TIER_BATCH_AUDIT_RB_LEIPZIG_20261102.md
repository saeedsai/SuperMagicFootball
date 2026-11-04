# Rating-tier source batch audit: RB Leipzig (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_uefa_15` records in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each ledger source ID was checked against its official EA SPORTS FC 27 individual ratings page and the official [RB Leipzig team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/rb-leipzig/112172). EA's pages display all twelve identities as RB Leipzig players. Source positions and OVR are observations only. No roster fields, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a player-page leaf label that directly matches a canonical field counts as an observation. Category summaries do not count: EA `Passing`, `Pace`, and `Defending` are group headings, not equivalents for the game's `passing`, `speedRating`, or `defence` inputs. In the EA Dribbling group, the separately displayed `Dribbling` leaf is counted. EA `Finishing` is not treated as `shootAccuracy`, `Heading Accuracy` is not treated as `heading`, and `GK Reflexes` is not treated as `gkSkill`.

EA's FC 27 pages describe launch Gold, Silver, and Bronze Ultimate Team player items; they exclude other item types and live form updates in other modes. Team affiliation can change. EA OVR and attributes are not a substitute for the game's six canonical inputs, and this report infers no rating scale, formula, tier, or eligibility.

`Game → EA` gives the ledger's broad primary position and EA's specific position. “—” means no direct same-name EA leaf for that canonical input. Every linked player page names the player, displays the URL's stable EA player ID, position, and RB Leipzig affiliation.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Maarten Vandevoordt | GK → GK | 242879 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/maarten-vandevoordt/242879) | `gkDiving` 80; `agility` 55; `strength` 62; `stamina` 38 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Ørjan Nyland | GK → GK | 185427 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rjan-nyland/185427) | `gkDiving` 73; `agility` 45; `strength` 70; `stamina` 33 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| David Raum | DF → LB | 236703 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/david-raum/236703) | `strength` 77; `aggression` 76; `stamina` 85 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Willi Orbán | DF → CB | 204638 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/willi-orban/204638) | `strength` 85; `aggression` 86; `stamina` 74 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Castello Lukeba | DF → CB | 262138 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/castello-lukeba/262138) | `strength` 78; `aggression` 78; `stamina` 69 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Nicolas Seiwald | MF → CDM | 257876 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nicolas-seiwald/257876) | `crossing` 75; `dribbling` 72 (leaf); `agility` 76; `stamina` 86 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Benjamin Henrichs | MF → RB | 228579 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/benjamin-henrichs/228579) | `crossing` 79; `dribbling` 77 (leaf); `agility` 67; `stamina` 65 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Rômulo | MF → ST | 73398 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/romulo/73398) | `crossing` 54; `dribbling` 79 (leaf); `agility` 77; `stamina` 85 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Brajan Gruda | MF → CAM | 272612 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/brajan-gruda/272612) | `crossing` 73; `dribbling` 85 (leaf); `agility` 86; `stamina` 70 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Christoph Baumgartner | FW → CAM | 242187 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/christoph-baumgartner/242187) | `shootPower` 75; `dribbling` 83 (leaf); `agility` 80 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Ridle Baku | FW → RB | 240709 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ridle-baku/240709) | `shootPower` 77; `dribbling` 82 (leaf); `agility` 78 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Antonio Nusa | FW → LW | 262863 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/antonio-nusa/262863) | `shootPower` 83; `dribbling` 88 (leaf); `agility` 91 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Eight of twelve EA positions fit the ledger's broad category. Four are cross-category discrepancies: Benjamin Henrichs is listed as `RB` against ledger `MF`; Rômulo as `ST` against `MF`; Christoph Baumgartner as `CAM` against `FW`; and Ridle Baku as `RB` against `FW`. These discrepancies are recorded only; neither ledger positions nor team entries were changed.

This batch has **38 of 72** direct same-name leaf observations and **34** unresolved canonical position-field slots. No player has all six position-specific inputs directly observed under this conservative matching rule. OVR and other EA categories are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_15` ledger rows and twelve distinct FC 27 player IDs; all twelve identities appear in EA's RB Leipzig FC 27 team list.
- Position accounting: 8 broad-position matches and 4 cross-category discrepancies.
- Field accounting: 38 direct observations plus 34 unresolved slots equals 72.
- Ledger SHA-256 at audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
