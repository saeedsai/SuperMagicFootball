# Rating-tier source batch audit: Manchester City (12 players)

**Audit date:** 2026-11-01  
**Scope:** read-only source verification against the existing `club26_2` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The 12 source IDs are distinct within this batch and do not repeat the player IDs audited in the Arsenal, Bayern, Barcelona, or Manchester United reports. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

Manchester City is audited as a previously unaudited 12-player `club26` batch. All 12 rows have an explicit FC27 source-player ID and official-check date. The official team listing is [EA SPORTS FC 27 Manchester City Player Ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/manchester-city/10). Each ID below was checked against the corresponding individual EA page for player name, source primary position, and published attribute details.

The game's canonical fields are the position-specific inputs in `data/mechanics/gameplay.json` (`positionOverallStats`). As in the [Arsenal](RATING_TIER_BATCH_AUDIT_ARSENAL_20261101.md), [Bayern](RATING_TIER_BATCH_AUDIT_BAYERN_20261101.md), [Barcelona](RATING_TIER_BATCH_AUDIT_BARCELONA_20261101.md), and [Manchester United](RATING_TIER_BATCH_AUDIT_MANCHESTER_UNITED_20261101.md) batch audits, only same-name leaf attributes count as field evidence. Group summaries such as Passing, Pace, or Defending, composites, and approximate synonyms remain unresolved. This is evidence for EA's displayed fields, not approval that EA ratings map to SuperMagicFootball's stat scale or formula.

EA describes these ratings pages as launch Gold/Silver/Bronze Ultimate Team items and excludes other item types and later live-form updates. These pages are authoritative for the EA fields they display, not proof of interchangeable stat scales.

## Player identity and directly observed leaf fields

`Game → EA` lists the ledger primary position and EA page primary position. `—` means no direct same-name leaf value for that canonical field; no value is inferred. Detailed Dribbling uses the leaf value within the Dribbling group, not the group summary. `shootPower` is directly paired with EA's leaf `Shot Power`, consistent with earlier audits. Where EA's primary position differs from the ledger group, the observations below are still organized by the existing ledger position; the report does not resolve that role-mapping question.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Gianluigi Donnarumma | GK → GK | 230621 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gianluigi-donnarumma/230621) | `gkDiving` 90; `agility` 57; `strength` 75; `stamina` 41 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Gerónimo Rulli | GK → GK | 215316 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/geronimo-rulli/215316) | `gkDiving` 81; `agility` 58; `strength` 73; `stamina` 41 | `gkSkill`; `passing` (category summary only) |
| Rúben Dias | DF → CB | 239818 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ruben-dias/239818) | `strength` 87; `aggression` 88; `stamina` 69 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA labels its leaf Heading Accuracy) |
| Joško Gvardiol | DF → CB | 251517 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/josko-gvardiol/251517) | `strength` 82; `aggression` 86; `stamina` 76 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Marc Guéhi | DF → CB | 241159 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marc-guehi/241159) | `strength` 83; `aggression` 82; `stamina` 76 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Elliot Anderson | MF → CDM | 254243 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/elliot-anderson/254243) | `crossing` 82; `dribbling` 82; `agility` 76; `stamina` 90 | `passing` (category summary); `speedRating` (Pace summary) |
| Phil Foden | MF → CAM | 237692 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/phil-foden/237692) | `crossing` 80; `dribbling` 88; `agility` 92; `stamina` 77 | `passing` (category summary); `speedRating` (Pace summary) |
| Jérémy Doku | MF → LW | 246420 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jeremy-doku/246420) | `crossing` 81; `dribbling` 90; `agility` 93; `stamina` 70 | `passing` (category summary); `speedRating` (Pace summary) |
| Matheus Nunes | MF → RB | 253124 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matheus-nunes/253124) | `crossing` 81; `dribbling` 79; `agility` 73; `stamina` 83 | `passing` (category summary); `speedRating` (Pace summary) |
| Erling Haaland | FW → ST | 239085 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/erling-haaland/239085) | `shootPower` 94 (EA Shot Power); `dribbling` 79; `agility` 66 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Rayan Cherki | FW → RW | 251570 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rayan-cherki/251570) | `shootPower` 81 (EA Shot Power); `dribbling` 92; `agility` 87 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Antoine Semenyo | FW → RW | 241236 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/antoine-semenyo/241236) | `shootPower` 85 (EA Shot Power); `dribbling` 86; `agility` 78 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Two records have an EA primary position outside the ledger's broad role: Jérémy Doku is `MF` in the game ledger but `LW` at EA; Matheus Nunes is ledger `MF` but EA `RB`. The other ten sources remain within the corresponding GK/DF/MF/FW group. These discrepancies are recorded without changing or normalizing the game positions. The source-to-game role policy remains unresolved.

## Result and gate

The EA pages provide **42 of 72** same-name leaf-field observations for the current position-specific six-field slots. The remaining **30 slots** have no direct leaf equivalent under the current method, including goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy`, and `heading`; canonical `passing` is represented only by EA's grouped Passing summary. No complete six-stat row is verified for any player in this batch.

These observations remain in this audit only. No EA value was copied into the roster or source ledger; all 12 records remain unverified for canonical game stats. No OVR, tier, rarity, ability eligibility, or assignment was calculated or changed. Field mapping, source snapshot policy, and position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 `club26_2` rows with 12 distinct player IDs and EA IDs; no player ID is repeated in the four earlier 12-player audit reports.
- Page cross-check: all 12 source IDs resolve to the linked official EA individual pages, with names consistent with the ledger; page positions are transcribed separately from game positions.
- Field accounting: 42 direct same-name leaf observations plus 30 explicitly unresolved position-field slots = 72; two broad-role discrepancies are recorded.
- Safety: documentation-only audit. No game roster data or source-ledger values were edited, no `stats_verified_flag` was enabled, and no tier was assigned.
