# Rating-tier source batch audit: Sporting CP (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_14` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The 12 records have distinct FC27 source IDs and do not overlap any of the fifteen previously documented club batches. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

The primary source is the [official EA SPORTS FC 27 Sporting CP ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/sporting-cp/237), with each listed source ID checked on its official EA individual player page below. The team list and player pages were used to confirm names, Sporting CP affiliation, stable source IDs, primary positions, and attributes shown.

The game's canonical position-specific fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a matching named leaf attribute counts as direct evidence. Group summaries such as Passing, Pace, and Defending, composites, and approximate synonyms remain unresolved. In the Dribbling group, the specifically named `Dribbling` leaf is recorded, not the group summary. This audit does not approve an EA-to-game scale or formula mapping.

EA's ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items; they exclude other item types and later live-form updates in other modes. Club affiliations can change. These pages are evidence only for the fields they display.

## Identity and directly observed leaf fields

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. `—` indicates no direct same-name leaf equivalent for that canonical field. Values below are observations only; none was copied into game data.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Rui Silva | GK → GK | 210385 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rui-silva/210385) | `gkDiving` 82; `agility` 34; `strength` 76; `stamina` 27 | `gkSkill`; `passing` (EA Passing is a category summary) |
| João Virgínia | GK → GK | 237704 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joao-virginia/237704) | `gkDiving` 73; `agility` 30; `strength` 57; `stamina` 16 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Maximiliano Araújo | DF → LM | 254817 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/maximiliano-araujo/254817) | `strength` 70; `aggression` 79; `stamina` 82 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Gonçalo Inácio | DF → CB | 257179 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/goncalo-inacio/257179) | `strength` 82; `aggression` 78; `stamina` 82 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Eduardo Quaresma | DF → CB | 252144 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/eduardo-quaresma/252144) | `strength` 77; `aggression` 75; `stamina` 69 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Geny Catamo | MF → RM | 266097 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/geny-catamo/266097) | `crossing` 72; `dribbling` 82; `agility` 91; `stamina` 79 | `passing` (category summary); `speedRating` (Pace summary) |
| Zeno Debast | MF → CB | 254262 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/zeno-debast/254262) | `crossing` 77; `dribbling` 76; `agility` 61; `stamina` 81 | `passing` (category summary); `speedRating` (Pace summary) |
| Altimira | MF → CDM | 276471 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/altimira/276471) | `crossing` 58; `dribbling` 75; `agility` 65; `stamina` 75 | `passing` (category summary); `speedRating` (Pace summary) |
| Daniel Bragança | MF → CM | 252143 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/daniel-braganca/252143) | `crossing` 65; `dribbling` 80; `agility` 77; `stamina` 68 | `passing` (category summary); `speedRating` (Pace summary) |
| Luis Javier Suárez | FW → ST | 245158 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luis-javier-suarez/245158) | `shootPower` 85 (EA Shot Power); `dribbling` 80; `agility` 74 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Pedro Gonçalves | FW → LM | 240950 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pedro-goncalves/240950) | `shootPower` 79 (EA Shot Power); `dribbling` 83; `agility` 82 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Rodrigo Zalazar | FW → CAM | 251377 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rodrigo-zalazar/251377) | `shootPower` 88 (EA Shot Power); `dribbling` 81; `agility` 85 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Four EA primary positions fall outside the game's broad ledger roles: Maximiliano Araújo is DF → LM, Zeno Debast is MF → CB, Pedro Gonçalves is FW → LM, and Rodrigo Zalazar is FW → CAM. The other eight fit their broad roles (GK; CB; RM/CM/CDM; ST). Exact EA positions are recorded above and were not applied to roster data.

## Result and gate

This batch has **42 of 72** direct same-name leaf observations for its position-specific six-field slots; **30** remain unresolved. The unresolved fields include goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy` and `heading`, and midfield `passing` represented only as an EA group summary. No player in this batch has a complete verified six-stat row under this matching rule.

No EA values were copied into game data or the source ledger. No OVR, tier, rarity, eligibility, or assignment was calculated or changed. EA-to-game field mapping and broad-position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 existing `club26_14` rows and 12 distinct source IDs.
- Prior-batch exclusion: all 12 IDs are unique to this club batch among the fifteen existing club reports.
- Source identity: every source ID resolves to the same named player on an official EA FC27 individual page; the official Sporting CP team list confirms club context.
- Field accounting: 42 direct leaf observations plus 30 unresolved position-field slots equals 72.
- Safety: documentation-only audit; roster and ledger values, verification flags, and tier assignments are unchanged.
