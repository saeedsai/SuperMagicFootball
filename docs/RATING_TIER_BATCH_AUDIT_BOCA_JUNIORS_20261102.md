# Rating-tier source batch audit: Boca Juniors (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_2` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The twelve stable FC 27 source IDs were checked against official EA SPORTS individual ratings pages and EA's current [Boca Juniors team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/boca-juniors/1877). Each player page reports the matching identity, source ID in its canonical URL, primary position and Boca Juniors affiliation. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute values are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. “—” means no direct same-name EA leaf for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Álvaro Montero | GK → GK | 229541 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alvaro-montero/229541) | `gkDiving` 76; `agility` 32; `strength` 77; `stamina` 45 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Agustín Marchesín | GK → GK | 201095 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/agustin-marchesin/201095) | `gkDiving` 76; `agility` 64; `strength` 57; `stamina` 38 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Lautaro Blanco | DF → LB | 257185 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lautaro-blanco/257185) | `strength` 77; `aggression` 71; `stamina` 83 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Lautaro Di Lollo | DF → CB | 272723 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lautaro-di-lollo/272723) | `strength` 93; `aggression` 71; `stamina` 78 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Leandro Lozano | DF → RB | 266844 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/leandro-lozano/266844) | `strength` 86; `aggression` 69; `stamina` 74 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Leandro Paredes | MF → CM | 207439 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/leandro-paredes/207439) | `crossing` 77; `dribbling` 78 (leaf); `agility` 68; `stamina` 85 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Carlos Palacios | MF → CAM | 242971 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/carlos-palacios/242971) | `crossing` 70; `dribbling` 76 (leaf); `agility` 74; `stamina` 70 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Malcom Braida | MF → LM | 258746 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/malcom-braida/258746) | `crossing` 71; `dribbling` 74 (leaf); `agility` 83; `stamina` 76 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Rodrigo Battaglia | MF → CDM | 219576 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rodrigo-battaglia/219576) | `crossing` 47; `dribbling` 68 (leaf); `agility` 62; `stamina` 73 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Sebastián Villa | FW → ST | 233959 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sebastian-villa/233959) | `shootPower` 82; `dribbling` 79 (leaf); `agility` 84 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Santiago Ascacíbar | FW → CDM | 232244 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/santiago-ascacibar/232244) | `shootPower` 77; `dribbling` 72 (leaf); `agility` 81 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Exequiel Zeballos | FW → LW | 260601 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/exequiel-zeballos/260601) | `shootPower` 71; `dribbling` 82 (leaf); `agility` 86 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancy and result

Eleven of twelve EA primary positions fit the ledger's broad GK, DF, MF, or FW category. Santiago Ascacíbar is listed as `CDM` against ledger `FW`, a cross-category discrepancy. It is recorded only; neither the ledger position nor team entry was changed.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and other EA category summaries were not copied into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_2` ledger rows and twelve distinct FC 27 source IDs; the official EA Boca Juniors team list confirms the team identity and current player listings.
- Position accounting: 11 broad-position matches and one cross-category discrepancy.
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Scope safety: no roster data or source-ledger fields changed.
