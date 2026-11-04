# Rating-tier source batch audit: Liverpool (12 players)

**Audit date:** 2026-11-01  
**Scope:** read-only source verification against the existing `club26_9` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The 12 player IDs are distinct within this batch and do not repeat player IDs in the Arsenal, Bayern, Barcelona, Manchester United, or Manchester City reports. The ledger's `fc27_official_checked_date` is blank for these records; the official EA pages were reviewed for this report on the audit date. No player, rating, tier, identity, source-ledger field, or check-date field was changed.

## Source and method

Liverpool is the next requested, previously unaudited 12-player club batch. The canonical ledger identifies it as `club26_9`; `club26_3` is Paris Saint-Germain. All 12 Liverpool records have a player ID and EA source-player ID. The official team listing is [EA SPORTS FC 27 Liverpool Player Ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/liverpool/9). Each ID below was checked against its individual EA page for player name, source primary position, and published attribute details.

The game's canonical fields are the position-specific inputs in `data/mechanics/gameplay.json` (`positionOverallStats`). As in the [Arsenal](RATING_TIER_BATCH_AUDIT_ARSENAL_20261101.md), [Bayern](RATING_TIER_BATCH_AUDIT_BAYERN_20261101.md), [Barcelona](RATING_TIER_BATCH_AUDIT_BARCELONA_20261101.md), [Manchester United](RATING_TIER_BATCH_AUDIT_MANCHESTER_UNITED_20261101.md), and [Manchester City](RATING_TIER_BATCH_AUDIT_MANCHESTER_CITY_20261101.md) reports, only same-name leaf attributes count as field evidence. Group summaries such as Passing, Pace, or Defending, composites, and approximate synonyms remain unresolved. This is evidence for EA's displayed fields, not approval that EA ratings map to SuperMagicFootball's stat scale or formula.

EA describes these ratings pages as launch Gold/Silver/Bronze Ultimate Team items and excludes other item types and later live-form updates. These pages are authoritative for the EA fields they display, not proof of interchangeable stat scales.

## Player identity and directly observed leaf fields

`Game → EA` lists the ledger primary position and EA page primary position. `—` means no direct same-name leaf value for that canonical field; no value is inferred. Detailed Dribbling uses the leaf value within the Dribbling group, not the group summary. `shootPower` is directly paired with EA's leaf `Shot Power`, consistent with earlier audits. When EA primary position differs from the ledger's role, fields below remain organized by the ledger's existing primary role and do not resolve that discrepancy.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Alisson | GK → GK | 212831 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alisson/212831) | `gkDiving` 85; `agility` 40; `strength` 78; `stamina` 32 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Giorgi Mamardashvili | GK → GK | 262621 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/giorgi-mamardashvili/262621) | `gkDiving` 82; `agility` 40; `strength` 74; `stamina` 45 | `gkSkill`; `passing` (category summary only) |
| Virgil van Dijk | DF → CB | 203376 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/virgil-van-dijk/203376) | `strength` 92; `aggression` 80; `stamina` 73 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA labels its leaf Heading Accuracy) |
| Dominik Szoboszlai | DF → CAM | 236772 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dominik-szoboszlai/236772) | `strength` 69; `aggression` 75; `stamina` 93 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Jeremie Frimpong | DF → RB | 253149 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jeremie-frimpong/253149) | `strength` 47; `aggression` 74; `stamina` 82 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Ryan Gravenberch | MF → CDM | 246104 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ryan-gravenberch/246104) | `crossing` 74; `dribbling` 86; `agility` 70; `stamina` 85 | `passing` (category summary); `speedRating` (Pace summary) |
| Alexis Mac Allister | MF → CM | 239837 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alexis-mac-allister/239837) | `crossing` 79; `dribbling` 80; `agility` 80; `stamina` 81 | `passing` (category summary); `speedRating` (Pace summary) |
| Cody Gakpo | MF → LM | 242516 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/cody-gakpo/242516) | `crossing` 82; `dribbling` 84; `agility` 70; `stamina` 76 | `passing` (category summary); `speedRating` (Pace summary) |
| Milos Kerkez | MF → LB | 260908 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/milos-kerkez/260908) | `crossing` 80; `dribbling` 78; `agility` 83; `stamina` 90 | `passing` (category summary); `speedRating` (Pace summary) |
| Alexander Isak | FW → ST | 233731 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alexander-isak/233731) | `shootPower` 91 (EA Shot Power); `dribbling` 85; `agility` 69 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Florian Wirtz | FW → CAM | 256630 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/florian-wirtz/256630) | `shootPower` 75 (EA Shot Power); `dribbling` 88; `agility` 88 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Hugo Ekitiké | FW → ST | 257289 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hugo-ekitike/257289) | `shootPower` 84 (EA Shot Power); `dribbling` 87; `agility` 70 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Four records have an EA primary position outside the ledger's broad role: Dominik Szoboszlai is ledger `DF` but EA `CAM`; Cody Gakpo is ledger `MF` but EA `LM`; Milos Kerkez is ledger `MF` but EA `LB`; Florian Wirtz is ledger `FW` but EA `CAM`. The other eight sources fall within the ledger role group under the prior audit convention. These discrepancies are recorded without changing or normalizing game positions. The source-to-game role policy remains unresolved.

## Result and gate

The EA pages provide **42 of 72** same-name leaf-field observations for the current position-specific six-field slots. The remaining **30 slots** have no direct leaf equivalent under the current method, including goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy`, and `heading`; canonical `passing` is represented only by EA's grouped Passing summary. No complete six-stat row is verified for any player in this batch.

These observations remain in this audit only. No EA value was copied into the roster or source ledger; all 12 records remain unverified for canonical game stats. No OVR, tier, rarity, ability eligibility, or assignment was calculated or changed. Field mapping, source snapshot policy, and position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 `club26_9` rows, 12 distinct player/source IDs, and no player ID repeated in the five earlier audit reports.
- Page cross-check: all 12 stable source IDs resolve to linked official EA individual pages, with names consistent with the ledger; page positions are transcribed separately from game positions.
- Ledger provenance: the prior dataset link for these rows is external and the dedicated `fc27_official_checked_date` is blank. This report records the fresh EA-page check but does not backfill that ledger field.
- Field accounting: 42 direct same-name leaf observations plus 30 explicitly unresolved position-field slots = 72; four broad-role discrepancies are recorded.
- Safety: documentation-only audit. No game roster data or source-ledger values were edited, no `stats_verified_flag` was enabled, and no tier was assigned.
