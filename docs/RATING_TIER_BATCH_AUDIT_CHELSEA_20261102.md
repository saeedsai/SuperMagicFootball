# Rating-tier source batch audit: Chelsea (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_18` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). All 12 ledger records have distinct FC27 IDs; no ID overlaps the ten previously audited club batches. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

The primary source is the [official EA SPORTS FC 27 Chelsea player ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/chelsea/5) and each linked official EA individual player page below. Names, stable player IDs, Chelsea affiliation, primary positions and attributes were checked on EA pages.

The game's canonical fields are the position-specific inputs in `data/mechanics/gameplay.json` (`positionOverallStats`). A value is recorded only where EA publishes a matching named leaf attribute. Category summaries such as Passing, Pace and Defending, composites and approximate synonyms are not direct matches. In the Dribbling category, the specifically named `Dribbling` leaf is recorded; its separate category summary is not. This audit does not approve an EA-to-game scale or formula mapping.

EA's ratings pages cover launch Gold, Silver and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes; club affiliations can change. They are evidence only for the fields shown on these pages.

## Identity and directly observed leaf fields

The position column shows the ledger's broad primary position followed by EA's specific primary position. `—` indicates no direct same-name leaf equivalent for that canonical field.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Robert Sánchez | GK → GK | 228789 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/robert-sanchez/228789) | `gkDiving` 81; `agility` 45; `strength` 77; `stamina` 40 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Mike Penders | GK → GK | 270821 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mike-penders/270821) | `gkDiving` 80; `agility` 32; `strength` 72; `stamina` 26 | `gkSkill`; `passing` (category summary only) |
| Reece James | DF → RB | 238074 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/reece-james/238074) | `strength` 87; `aggression` 83; `stamina` 68 | `defence` (category summary); `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Maxence Lacroix | DF → CB | 244067 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/maxence-lacroix/244067) | `strength` 83; `aggression` 83; `stamina` 79 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Levi Colwill | DF → CB | 262859 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/levi-colwill/262859) | `strength` 79; `aggression` 84; `stamina` 69 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Enzo Fernández | MF → CM | 247090 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/enzo-fernandez/247090) | `crossing` 81; `dribbling` 82; `agility` 75; `stamina` 88 | `passing` (category summary); `speedRating` (Pace summary) |
| Moisés Caicedo | MF → CDM | 256079 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/moises-caicedo/256079) | `crossing` 65; `dribbling` 79; `agility` 80; `stamina` 91 | `passing` (category summary); `speedRating` (Pace summary) |
| Pedro Neto | MF → RM | 238616 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pedro-neto/238616) | `crossing` 82; `dribbling` 81; `agility` 88; `stamina` 81 | `passing` (category summary); `speedRating` (Pace summary) |
| Estêvão | MF → RM | 76687 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/estevao/76687) | `crossing` 77; `dribbling` 85; `agility` 91; `stamina` 67 | `passing` (category summary); `speedRating` (Pace summary) |
| Cole Palmer | FW → CAM | 257534 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/cole-palmer/257534) | `shootPower` 85 (EA Shot Power); `dribbling` 85; `agility` 78 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Morgan Rogers | FW → CAM | 260247 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/morgan-rogers/260247) | `shootPower` 84 (EA Shot Power); `dribbling` 86; `agility` 77 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| João Pedro | FW → ST | 252042 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joao-pedro/252042) | `shootPower` 83 (EA Shot Power); `dribbling` 85; `agility` 77 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Two EA primary positions fall outside the game's broad ledger roles: Cole Palmer is ledger FW → EA CAM, and Morgan Rogers is ledger FW → EA CAM. The other ten positions fit their broad role (GK; RB/CB; CM/CDM/RM; ST). These source positions are reported as observed and did not change roster data.

## Result and gate

This batch has **42 of 72** direct same-name leaf observations for its position-specific six-field slots; **30** slots remain unresolved. The unresolved fields are goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy` and `heading`, plus midfield `passing` represented only as an EA group summary. Therefore no player in this batch has a complete verified six-stat row under this matching rule.

No EA values were copied into game data or the source ledger. All 12 players remain unverified for canonical game statistics; no OVR, tier, rarity, eligibility or assignment was calculated or changed. Source-to-game mapping and broad-position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 existing `club26_18` rows and 12 distinct source IDs.
- Source identity: each ID resolves to the same named player on its direct EA FC27 individual page; the official Chelsea list confirms club context.
- Field accounting: 42 direct leaf observations plus 30 unresolved position-field slots equals 72.
- Safety: documentation-only audit; roster and ledger values, verification flags and tier assignments are unchanged.
