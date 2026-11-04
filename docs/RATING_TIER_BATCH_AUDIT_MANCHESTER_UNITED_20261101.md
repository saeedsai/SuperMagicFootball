# Rating-tier source batch audit: Manchester United (12 players)

**Audit date:** 2026-11-01  
**Scope:** read-only source verification against the existing `club26_5` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

Manchester United is the next unaudited 12-player `club26` batch after Arsenal (`club26_0`), Bayern Munich (`club26_1`), and Barcelona (`club26_4`). All 12 rows have an explicit FC27 source-player ID and official-check date. The official team listing is [EA SPORTS FC 27 Manchester United Player Ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/man-utd/11). Each ID below was checked against an individual EA page for player name, source primary position, and published attribute details.

The game's canonical fields are the position-specific inputs in `data/mechanics/gameplay.json` (`positionOverallStats`). As in the [Arsenal](RATING_TIER_BATCH_AUDIT_ARSENAL_20261101.md), [Bayern](RATING_TIER_BATCH_AUDIT_BAYERN_20261101.md), and [Barcelona](RATING_TIER_BATCH_AUDIT_BARCELONA_20261101.md) batch audits, only same-name leaf attributes count as field evidence. Group summaries such as Passing, Pace, or Defending, composites, and approximate synonyms remain unresolved. This is evidence for EA's displayed fields, not approval that EA ratings map to SuperMagicFootball's stat scale or formula.

EA describes these ratings pages as launch Gold/Silver/Bronze Ultimate Team items and excludes other item types and later live-form updates. These pages are authoritative for the EA fields they display, not proof of interchangeable stat scales.

## Player identity and directly observed leaf fields

`Game → EA` lists the ledger primary position and EA page primary position. `—` means no direct same-name leaf value for that canonical field; no value is inferred. Detailed Dribbling uses the leaf value within the Dribbling group, not the group summary. `shootPower` is directly paired with EA's leaf `Shot Power`, consistent with the prior audits.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Senne Lammens | GK → GK | 254803 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/senne-lammens/254803) | `gkDiving` 80; `agility` 52; `strength` 79; `stamina` 35 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Karl Darlow | GK → GK | 193331 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/karl-darlow/193331) | `gkDiving` 76; `agility` 64; `strength` 64; `stamina` 44 | `gkSkill`; `passing` (category summary only) |
| Harry Maguire | DF → CB | 203263 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/harry-maguire/203263) | `strength` 90; `aggression` 87; `stamina` 66 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA labels its leaf Heading Accuracy) |
| Lisandro Martínez | DF → CB | 239301 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lisandro-martinez/239301) | `strength` 76; `aggression` 92; `stamina` 55 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Matthijs de Ligt | DF → CB | 235243 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matthijs-de-ligt/235243) | `strength` 89; `aggression` 85; `stamina` 60 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Bruno Fernandes | MF → CAM | 212198 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bruno-fernandes/212198) | `crossing` 89; `dribbling` 82; `agility` 78; `stamina` 95 | `passing` (category summary); `speedRating` (Pace summary) |
| Youri Tielemans | MF → CM | 216393 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/youri-tielemans/216393) | `crossing` 80; `dribbling` 80; `agility` 61; `stamina` 78 | `passing` (category summary); `speedRating` (Pace summary) |
| Marcus Rashford | MF → LW | 231677 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marcus-rashford/231677) | `crossing` 82; `dribbling` 84; `agility` 79; `stamina` 70 | `passing` (category summary); `speedRating` (Pace summary) |
| Kobbie Mainoo | MF → CDM | 269136 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kobbie-mainoo/269136) | `crossing` 70; `dribbling` 84; `agility` 80; `stamina` 78 | `passing` (category summary); `speedRating` (Pace summary) |
| Bryan Mbeumo | FW → RM | 243014 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bryan-mbeumo/243014) | `shootPower` 82 (EA Shot Power); `dribbling` 84; `agility` 90 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Matheus Cunha | FW → LM | 240243 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matheus-cunha/240243) | `shootPower` 87 (EA Shot Power); `dribbling` 86; `agility` 76 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Benjamin Šeško | FW → ST | 260592 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/benjamin-sesko/260592) | `shootPower` 86 (EA Shot Power); `dribbling` 78; `agility` 70 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Three records have a source primary position outside the ledger's broad role: Marcus Rashford is `MF` in the game ledger but `LW` at EA; Bryan Mbeumo is ledger `FW` but EA `RM`; Matheus Cunha is ledger `FW` but EA `LM`. The other nine sources remain within the corresponding GK/DF/MF/FW group. These discrepancies are recorded without changing or normalizing game positions. The source-to-game role policy remains unresolved.

## Result and gate

The EA pages provide **42 of 72** same-name leaf-field observations for the current position-specific six-field slots. The remaining **30 slots** have no direct leaf equivalent under the current method, including goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy`, and `heading`; canonical `passing` is represented only by EA's grouped Passing summary. No complete six-stat row is verified for any player in this batch.

These observations remain in this audit only. No EA value was copied into the roster or source ledger; all 12 records remain unverified for canonical game stats. No OVR, tier, rarity, ability eligibility, or assignment was calculated or changed. Field mapping, source snapshot policy, and position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 `club26_5` rows; all 12 have unique, non-empty EA IDs and official check dates.
- Page cross-check: all 12 source IDs resolve to linked official EA individual pages, with names consistent with the ledger; page positions are transcribed separately from game positions.
- Field accounting: 42 direct same-name leaf observations plus 30 explicitly unresolved position-field slots = 72; three broad-role discrepancies are recorded.
- Safety: documentation-only audit. No game roster data or source-ledger values were edited, no `stats_verified_flag` was enabled, and no tier was assigned.
