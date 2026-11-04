# Rating-tier source batch audit: FC Barcelona (12 players)

**Audit date:** 2026-11-01  
**Scope:** read-only source verification against the existing `club26_4` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

Barcelona is the next 12-player `club26` batch after Arsenal (`club26_0`) and Bayern Munich (`club26_1`). All 12 rows have an explicit FC27 source-player ID and official-check date. The official team listing is [EA SPORTS FC 27 FC Barcelona Player Ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/fc-barcelona/241). Each ID below was checked against an individual EA page for name, primary position, and displayed attribute details.

The game's canonical fields are the position-specific inputs in `data/mechanics/gameplay.json` (`positionOverallStats`). As in the [Arsenal batch audit](RATING_TIER_BATCH_AUDIT_ARSENAL_20261101.md) and [Bayern batch audit](RATING_TIER_BATCH_AUDIT_BAYERN_20261101.md), only same-name leaf attributes count as field evidence. Group summaries such as Passing, Pace, or Defending, composites, and approximate synonyms are unresolved. This is evidence for EA's displayed fields, not approval that EA ratings map to SuperMagicFootball's stat scale or formula.

EA describes these ratings pages as launch Gold/Silver/Bronze Ultimate Team items and excludes other item types and later live-form updates. The audit therefore does not treat EA's item ratings as interchangeable with game values.

## Player identity and directly observed leaf fields

`Game → EA` lists the ledger primary position and EA page primary position. `—` means no direct same-name leaf value for that canonical field; no value is inferred. Detailed Dribbling uses the leaf value within the Dribbling group, not the group summary. `shootPower` is directly paired with EA's leaf `Shot Power`, consistent with the earlier batches.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Joan García | GK → GK | 259532 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joan-garcia/259532) | `gkDiving` 85; `agility` 59; `strength` 59; `stamina` 35 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Wojciech Szczęsny | GK → GK | 186153 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/wojciech-szczesny/186153) | `gkDiving` 78; `agility` 55; `strength` 65; `stamina` 45 | `gkSkill`; `passing` (category summary only) |
| Pau Cubarsí | DF → CB | 278046 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pau-cubarsi/278046) | `strength` 83; `aggression` 82; `stamina` 75 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA labels its leaf Heading Accuracy) |
| Eric García | DF → CB | 245037 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/eric-garcia/245037) | `strength` 81; `aggression` 84; `stamina` 80 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Jules Koundé | DF → RB | 241486 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jules-kounde/241486) | `strength` 84; `aggression` 78; `stamina` 85 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Pedri | MF → CM | 251854 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pedri/251854) | `crossing` 79; `dribbling` 89; `agility` 92; `stamina` 89 | `passing` (category summary); `speedRating` (Pace summary) |
| Rodri | MF → CDM | 231866 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rodri/231866) | `crossing` 79; `dribbling` 80; `agility` 55; `stamina` 81 | `passing` (category summary); `speedRating` (Pace summary) |
| Frenkie de Jong | MF → CM | 228702 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/frenkie-de-jong/228702) | `crossing` 78; `dribbling` 80; `agility` 87; `stamina` 87 | `passing` (category summary); `speedRating` (Pace summary) |
| Fermín | MF → CAM | 277179 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/fermin/277179) | `crossing` 70; `dribbling` 84; `agility` 83; `stamina` 88 | `passing` (category summary); `speedRating` (Pace summary) |
| Lamine Yamal | FW → RW | 277643 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lamine-yamal/277643) | `shootPower` 83 (EA Shot Power); `dribbling` 95; `agility` 94 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Raphinha | FW → LW | 233419 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/raphinha/233419) | `shootPower` 84 (EA Shot Power); `dribbling` 86; `agility` 88 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Dani Olmo | FW → CAM | 244260 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dani-olmo/244260) | `shootPower` 79 (EA Shot Power); `dribbling` 83; `agility` 86 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancy

EA and the ledger use positions at different levels of specificity. The official EA position is within the same GK/DF/MF/FW group for 11 players. Dani Olmo is the exception: the ledger primary group is `FW`, while the EA page's primary position is `CAM` (with `LW` as an alternate). This discrepancy is recorded without changing or normalizing the game position. Position reconciliation remains a policy question.

## Result and gate

The EA pages provide **42 of 72** same-name leaf-field observations for the current position-specific six-field slots. The remaining **30 slots** have no direct leaf equivalent under the current method, including goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy`, and `heading`; canonical `passing` is represented only by EA's grouped Passing summary. No complete six-stat row is verified for any player in this batch.

These observations remain in this audit only. No EA value was copied into the roster or source ledger; all 12 records remain unverified for canonical game stats. No OVR, tier, rarity, ability eligibility, or assignment was calculated or changed. Field mapping, source snapshot policy, and position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 `club26_4` rows; all 12 have unique, non-empty EA IDs and official check dates.
- Page cross-check: all 12 source IDs resolve to linked official EA individual pages, with names consistent with the ledger; page positions are transcribed separately from game positions.
- Field accounting: 42 direct same-name leaf observations plus 30 explicitly unresolved position-field slots = 72; the single source/game broad-position mismatch is recorded.
- Safety: documentation-only audit. No game roster data or source-ledger values were edited, no `stats_verified_flag` was enabled, and no tier was assigned.
