# Rating-tier source batch audit: Nacional (12 ledger players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_4` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using each row's stable `fc27_source_player_id`. The official EA FC 27 [Nacional CONMEBOL Libertadores team ratings list](https://www.ea.com/es/games/ea-sports-fc/ratings/teams-ratings/nacional/111325) and stable-ID individual pages were checked. No roster, ledger, game, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct field evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the category heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game scale or formula is inferred. EA's FC 27 pages describe launch Gold, Silver and Bronze Ultimate Team items; they exclude other item types and later live-form updates. Sources checked on 2026-11-02.

## Identity and directly observed canonical fields

`Game → EA` shows the ledger's broad position followed by EA's specific primary position. “Unresolved” means the individual EA page did not have a directly matching leaf for that canonical input. Two stable IDs below resolve to same-name players on the Portuguese club also called Nacional, rather than the requested CONMEBOL Libertadores Nacional; their direct leaves are shown as observations, but they are not confirmed for the intended team rows.

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Alexis Martín Arias | GK → GK | 217805 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alexis-martin-arias/217805) | `gkDiving` 70; `agility` 46; `strength` 65; `stamina` 37 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Luis Mejía | GK → GK | 202089 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/luis-mejia/202089) | `gkDiving` 74; `agility` 60; `strength` 76; `stamina` 37 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Sebastián Coates | DF → CB | 197655 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/sebastian-coates/197655) | `strength` 89; `aggression` 73; `stamina` 65 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Camilo Cándido | DF → LB | 242335 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/camilo-candido/242335) | `strength` 43; `aggression` 66; `stamina` 75 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Zé Vítor | DF → CB | 73128 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/ze-vitor/73128) | `strength` 91; `aggression` 76; `stamina` 76* | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Luciano Boggio | MF → CM | 265766 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/luciano-boggio/265766) | `crossing` 70; `dribbling` 69 (leaf); `agility` 79; `stamina` 85 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Bruno Zuculini | MF → CM | 203864 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/bruno-zuculini/203864) | `crossing` 64; `dribbling` 72 (leaf); `agility` 69; `stamina` 74 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Liziero | MF → CM | 245319 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/liziero/245319) | `crossing` 53; `dribbling` 74 (leaf); `agility` 71; `stamina` 71* | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lucas Rodríguez | MF → CDM | 260208 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/lucas-rodriguez/260208) | `crossing` 49; `dribbling` 66 (leaf); `agility` 70; `stamina` 88 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Maximiliano Gómez | FW → ST | 239207 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/maximiliano-gomez/239207) | `shootPower` 80; `dribbling` 64 (leaf); `agility` 64 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Maximiliano Silvera | FW → ST | 267406 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/maximiliano-silvera/267406) | `shootPower` 56; `dribbling` 67 (leaf); `agility` 85 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Baltasar Barcia | FW → RM | 264353 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/baltasar-barcia/264353) | `shootPower` 60; `dribbling` 67 (leaf); `agility` 72 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

\* EA's official pages for Zé Vítor and Liziero assign the exact stable IDs above to players of the same names at **Nacional in Liga Portugal**, not Nacional in CONMEBOL Libertadores. The Portugal team page is [EA's Nacional, Liga Portugal list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/nacional/1891); those entries appear there as Zé Vítor (CB) and Liziero (CM), while neither appears in the requested CONMEBOL team's roster list. The name and stable ID agree, but team affiliation contradicts this ledger batch. Treat the seven canonical leaves shown for these two rows as source observations only, not verified values for the intended CONMEBOL rows. Resolving this requires correcting/validating the upstream identity mapping; no replacement identity is guessed here.

## Position and result

The EA primary positions fit the ledger's broad GK, DF, MF or FW category for all twelve rows. No broad-position discrepancy was found. This position check does not remove the separate club/source mismatch affecting Zé Vítor and Liziero.

The pages expose **42 of 72** direct same-name leaves, leaving **30** fields with no matching individual leaf. Of the 42 observed leaves, **35** come from IDs whose club affiliation matches the requested CONMEBOL Nacional list; the other **7** belong to the two stable-ID records that EA places at Nacional in Liga Portugal and are not validated for these team rows. No EA group summaries or OVR values were copied into game data, and no tier or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_4` ledger rows and twelve distinct `fc27_source_player_id` values.
- EA team evidence: ten audited IDs/names appear on the official [CONMEBOL Libertadores Nacional team list](https://www.ea.com/es/games/ea-sports-fc/ratings/teams-ratings/nacional/111325); Zé Vítor and Liziero instead appear on EA's separate [Nacional Liga Portugal team list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/nacional/1891). Their source IDs cannot be accepted as team-verified for the CONMEBOL rows until the mapping is resolved.
- Position accounting: 12 broad-position matches and zero cross-category discrepancies; two club/source mismatches are separately documented.
- Field accounting: 35 team-consistent direct leaves + 7 directly observed but team-conflicted leaves + 30 unresolved same-name leaves = 72.
- Ledger SHA-256 before and after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster, ledger, game, tier, backlog, or shared index data changed.
