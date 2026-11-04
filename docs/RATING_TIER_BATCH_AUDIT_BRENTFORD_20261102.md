# Rating-tier source batch audit: Brentford (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_15` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The 12 records have distinct FC27 source IDs and do not overlap any of the fourteen previously documented club batches. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

The primary source is the [official EA SPORTS FC 27 Brentford ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/brentford/1925), with each listed source ID checked on its official EA individual player page below. The team list and individual pages were used to confirm names, Brentford affiliation, stable source IDs, primary positions, and attributes shown.

The game's canonical position-specific fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a matching named leaf attribute counts as direct evidence. Group summaries such as Passing, Pace, and Defending, composites, and approximate synonyms remain unresolved. In the Dribbling group, the specifically named `Dribbling` leaf is recorded, not the group summary. This audit does not approve an EA-to-game scale or formula mapping.

EA's ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items; they exclude other item types and later live-form updates in other modes. Club affiliations can change. These pages are evidence only for the fields they display.

## Identity and directly observed leaf fields

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. `—` indicates no direct same-name leaf equivalent for that canonical field. Values below are observations only; none was copied into game data.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Caoimhín Kelleher | GK → GK | 240913 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/caoimhin-kelleher/240913) | `gkDiving` 80; `agility` 44; `strength` 71; `stamina` 19 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Hákon Valdimarsson | GK → GK | 264133 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hakon-valdimarsson/264133) | `gkDiving` 68; `agility` 32; `strength` 50; `stamina` 35 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Michael Kayode | DF → RB | 277869 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/michael-kayode/277869) | `strength` 77; `aggression` 75; `stamina` 88 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Nathan Collins | DF → CB | 248484 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nathan-collins/248484) | `strength` 83; `aggression` 78; `stamina` 78 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Sepp van den Berg | DF → CB | 242453 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sepp-van-den-berg/242453) | `strength` 78; `aggression` 73; `stamina` 71 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Mamadou Sangaré | MF → CM | 258601 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mamadou-sangare/258601) | `crossing` 61; `dribbling` 80; `agility` 78; `stamina` 85 | `passing` (category summary); `speedRating` (Pace summary) |
| Mathias Jensen | MF → CM | 229723 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mathias-jensen/229723) | `crossing` 83; `dribbling` 77; `agility` 77; `stamina` 76 | `passing` (category summary); `speedRating` (Pace summary) |
| Mikkel Damsgaard | MF → CAM | 241508 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mikkel-damsgaard/241508) | `crossing` 79; `dribbling` 81; `agility` 82; `stamina` 78 | `passing` (category summary); `speedRating` (Pace summary) |
| Vitaly Janelt | MF → CDM | 235167 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/vitaly-janelt/235167) | `crossing` 70; `dribbling` 72; `agility` 68; `stamina` 79 | `passing` (category summary); `speedRating` (Pace summary) |
| Igor Thiago | FW → ST | 275771 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/igor-thiago/275771) | `shootPower` 85 (EA Shot Power); `dribbling` 75; `agility` 65 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Dango Ouattara | FW → RM | 265552 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dango-ouattara/265552) | `shootPower` 74 (EA Shot Power); `dribbling` 82; `agility` 75 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Kevin Schade | FW → LM | 260926 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kevin-schade/260926) | `shootPower` 77 (EA Shot Power); `dribbling` 80; `agility` 73 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Two EA primary positions fall outside the game's broad ledger roles: Dango Ouattara is FW → RM and Kevin Schade is FW → LM. The other ten positions fit their broad roles (GK; RB/CB; CM/CAM/CDM; ST). Exact EA positions are recorded above and were not applied to roster data.

## Result and gate

This batch has **42 of 72** direct same-name leaf observations for its position-specific six-field slots; **30** remain unresolved. The unresolved fields include goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy` and `heading`, and midfield `passing` represented only as an EA group summary. No player in this batch has a complete verified six-stat row under this matching rule.

No EA values were copied into game data or the source ledger. No OVR, tier, rarity, eligibility, or assignment was calculated or changed. EA-to-game field mapping and broad-position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 existing `club26_15` rows and 12 distinct source IDs.
- Prior-batch exclusion: all 12 IDs are unique to this club batch among the fourteen existing club reports.
- Source identity: every source ID resolves to the same named player on an official EA FC27 individual page; the official Brentford team list confirms the club context.
- Field accounting: 42 direct leaf observations plus 30 unresolved position-field slots equals 72.
- Safety: documentation-only audit; roster and ledger values, verification flags, and tier assignments are unchanged.
