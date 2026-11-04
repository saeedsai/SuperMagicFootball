# Rating-tier source batch audit: Paris Saint-Germain (12 players)

**Audit date:** 2026-11-01  
**Scope:** read-only source verification against the existing `club26_3` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). This is the Paris Saint-Germain roster, distinct from Liverpool (`club26_9`). The 12 player IDs are distinct within the batch and do not repeat the IDs in the six prior audit batches. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

Paris Saint-Germain is audited as the next 12-player club batch. All 12 rows have an explicit FC27 source-player ID and official-check date. The official team listing is [EA SPORTS FC 27 Paris SG Player Ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/paris-sg/73). Each ID below was checked against its individual EA page for player name, source primary position, and published attribute details.

The game's canonical fields are the position-specific inputs in `data/mechanics/gameplay.json` (`positionOverallStats`). As in the [Arsenal](RATING_TIER_BATCH_AUDIT_ARSENAL_20261101.md), [Bayern](RATING_TIER_BATCH_AUDIT_BAYERN_20261101.md), [Barcelona](RATING_TIER_BATCH_AUDIT_BARCELONA_20261101.md), [Manchester United](RATING_TIER_BATCH_AUDIT_MANCHESTER_UNITED_20261101.md), [Manchester City](RATING_TIER_BATCH_AUDIT_MANCHESTER_CITY_20261101.md), and [Liverpool](RATING_TIER_BATCH_AUDIT_LIVERPOOL_20261101.md) reports, only same-name leaf attributes count as field evidence. Group summaries such as Passing, Pace, or Defending, composites, and approximate synonyms remain unresolved. This is evidence for EA's displayed fields, not approval that EA ratings map to SuperMagicFootball's stat scale or formula.

EA describes these ratings pages as launch Gold/Silver/Bronze Ultimate Team items and excludes other item types and later live-form updates. These pages are authoritative for the EA fields they display, not proof of interchangeable stat scales.

## Player identity and directly observed leaf fields

`Game → EA` lists the ledger primary position and EA page primary position. `—` means no direct same-name leaf value for that canonical field; no value is inferred. Detailed Dribbling uses the leaf value within the Dribbling group, not the group summary. `shootPower` is directly paired with EA's leaf `Shot Power`, consistent with earlier audits.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Matvey Safonov | GK → GK | 240225 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matvey-safonov/240225) | `gkDiving` 82; `agility` 55; `strength` 65; `stamina` 43 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Lucas Chevalier | GK → GK | 251752 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lucas-chevalier/251752) | `gkDiving` 83; `agility` 38; `strength` 53; `stamina` 41 | `gkSkill`; `passing` (category summary only) |
| Nuno Mendes | DF → LB | 252145 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nuno-mendes/252145) | `strength` 78; `aggression` 75; `stamina` 85 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA labels its leaf Heading Accuracy) |
| Willian Pacho | DF → CB | 256196 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/willian-pacho/256196) | `strength` 89; `aggression` 86; `stamina` 78 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Achraf Hakimi | DF → RB | 235212 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/achraf-hakimi/235212) | `strength` 75; `aggression` 77; `stamina` 95 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Vitinha | MF → CM | 255253 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/vitinha/255253) | `crossing` 78; `dribbling` 91; `agility` 92; `stamina` 89 | `passing` (category summary); `speedRating` (Pace summary) |
| João Neves | MF → CM | 272834 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joao-neves/272834) | `crossing` 69; `dribbling` 85; `agility` 84; `stamina` 92 | `passing` (category summary); `speedRating` (Pace summary) |
| Fabián Ruiz | MF → CM | 226271 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/fabian-ruiz/226271) | `crossing` 77; `dribbling` 82; `agility` 65; `stamina` 83 | `passing` (category summary); `speedRating` (Pace summary) |
| Warren Zaïre-Emery | MF → CM | 270673 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/warren-zaire-emery/270673) | `crossing` 68; `dribbling` 79; `agility` 75; `stamina` 93 | `passing` (category summary); `speedRating` (Pace summary) |
| Ousmane Dembélé | FW → ST | 231443 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ousmane-dembele/231443) | `shootPower` 91 (EA Shot Power); `dribbling` 94; `agility` 94 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Khvicha Kvaratskhelia | FW → LW | 247635 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/khvicha-kvaratskhelia/247635) | `shootPower` 89 (EA Shot Power); `dribbling` 92; `agility` 86 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Désiré Doué | FW → RW | 271421 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/desire-doue/271421) | `shootPower` 86 (EA Shot Power); `dribbling` 92; `agility` 88 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

No source primary position falls outside the ledger's GK/DF/MF/FW role group under the prior audit convention: the two goalkeeper records remain GK, the three defenders are LB/CB/RB, the four midfielders are CM, and the three forwards are ST/LW/RW. More specific EA positions are transcribed in the table without changing the game's broad positions.

## Result and gate

The EA pages provide **42 of 72** same-name leaf-field observations for the current position-specific six-field slots. The remaining **30 slots** have no direct leaf equivalent under the current method, including goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy`, and `heading`; canonical `passing` is represented only by EA's grouped Passing summary. No complete six-stat row is verified for any player in this batch.

These observations remain in this audit only. No EA value was copied into the roster or source ledger; all 12 records remain unverified for canonical game stats. No OVR, tier, rarity, ability eligibility, or assignment was calculated or changed. Field mapping, source snapshot policy, and position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 `club26_3` rows, 12 distinct player/source IDs, and no player ID repeated in the six prior audit reports.
- Page cross-check: all 12 source IDs resolve to the linked official EA individual pages; names and Paris SG affiliation match the official team roster.
- Field accounting: 42 direct same-name leaf observations plus 30 explicitly unresolved position-field slots = 72; no broad-role discrepancies were found.
- Safety: documentation-only audit. No game roster data or source-ledger values were edited, no `stats_verified_flag` was enabled, and no tier was assigned.
