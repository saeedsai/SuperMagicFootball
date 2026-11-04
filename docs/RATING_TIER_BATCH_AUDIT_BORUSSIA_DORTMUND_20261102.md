# Rating-tier source batch audit: Borussia Dortmund (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_11` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). All 12 ledger records have distinct FC27 source IDs; none overlaps the eleven previously audited club batches. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

The primary source is the [official EA SPORTS FC 27 Borussia Dortmund player ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/borussia-dortmund/22) and each linked official EA individual player page below. Each player's name and source ID were checked on EA's individual page, along with the listed Borussia Dortmund affiliation and primary position.

The game's canonical fields are the position-specific inputs in `data/mechanics/gameplay.json` (`positionOverallStats`). A value is recorded only where EA publishes a matching named leaf attribute. Category summaries such as Passing, Pace and Defending, composites and approximate synonyms are not direct matches. For Dribbling, the specifically named `Dribbling` leaf is recorded, not the separate category summary. This audit does not approve an EA-to-game scale or formula mapping.

EA's ratings pages cover launch Gold, Silver and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes; club affiliations can change. These pages are evidence only for the fields shown.

## Identity and directly observed leaf fields

The position column shows the ledger's broad primary position followed by EA's specific primary position. `—` indicates no direct same-name leaf equivalent for that canonical field.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Gregor Kobel | GK → GK | 235073 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gregor-kobel/235073) | `gkDiving` 88; `agility` 37; `strength` 81; `stamina` 32 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Alexander Meyer | GK → GK | 241050 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alexander-meyer/241050) | `gkDiving` 72; `agility` 22; `strength` 79; `stamina` 19 | `gkSkill`; `passing` (category summary only) |
| Nico Schlotterbeck | DF → CB | 247819 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nico-schlotterbeck/247819) | `strength` 87; `aggression` 84; `stamina` 75 | `defence` (category summary); `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Waldemar Anton | DF → CB | 229476 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/waldemar-anton/229476) | `strength` 87; `aggression` 86; `stamina` 79 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Julian Ryerson | DF → RB | 229891 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/julian-ryerson/229891) | `strength` 80; `aggression` 86; `stamina` 86 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Felix Nmecha | MF → CM | 246863 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/felix-nmecha/246863) | `crossing` 64; `dribbling` 86; `agility` 77; `stamina` 84 | `passing` (category summary); `speedRating` (Pace summary) |
| Joey Veerman | MF → CM | 253109 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joey-veerman/253109) | `crossing` 80; `dribbling` 75; `agility` 71; `stamina` 76 | `passing` (category summary); `speedRating` (Pace summary) |
| Marcel Sabitzer | MF → CM | 204923 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marcel-sabitzer/204923) | `crossing` 77; `dribbling` 78; `agility` 76; `stamina` 82 | `passing` (category summary); `speedRating` (Pace summary) |
| Emre Can | MF → CB | 208333 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/emre-can/208333) | `crossing` 63; `dribbling` 72; `agility` 64; `stamina` 69 | `passing` (category summary); `speedRating` (Pace summary) |
| Serhou Guirassy | FW → ST | 215441 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/serhou-guirassy/215441) | `shootPower` 90 (EA Shot Power); `dribbling` 81; `agility` 77 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Maximilian Beier | FW → CAM | 254117 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/maximilian-beier/254117) | `shootPower` 81 (EA Shot Power); `dribbling` 81; `agility` 81 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Daniel Svensson | FW → LB | 259716 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/daniel-svensson/259716) | `shootPower` 64 (EA Shot Power); `dribbling` 75; `agility` 81 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Three EA positions fall outside the game's broad ledger roles: Emre Can is MF → EA CB; Maximilian Beier is FW → EA CAM; and Daniel Svensson is FW → EA LB. The other nine positions fit their broad role (GK; CB/RB; CM; ST). These positions are observations only and were not written to game data.

## Result and gate

This batch has **42 of 72** direct same-name leaf observations for its position-specific six-field slots; **30** remain unresolved. These include goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy` and `heading`, and midfield `passing` represented only as an EA category summary. No player has a complete verified six-stat row under this matching rule.

No EA values were copied into game data or the source ledger. All 12 players remain unverified for canonical game statistics; no OVR, tier, rarity, eligibility or assignment was calculated or changed. Source-to-game mapping and broad-position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 existing `club26_11` ledger rows and 12 distinct source IDs.
- Source identity: all IDs resolve to the matching player name on direct EA FC27 individual pages; the official Borussia Dortmund listing and individual pages confirm club context.
- Field accounting: 42 direct leaf observations plus 30 unresolved position-field slots equals 72.
- Safety: documentation-only audit; roster and ledger values, verification flags and tier assignments are unchanged.
