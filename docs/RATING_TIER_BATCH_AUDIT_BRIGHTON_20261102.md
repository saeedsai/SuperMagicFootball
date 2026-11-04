# Rating-tier source batch audit: Brighton & Hove Albion (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_12` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The 12 records have distinct FC27 source IDs and no ID overlaps the thirteen previously documented club batches. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

The primary source is the [official EA SPORTS FC 27 Brighton ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/brighton/1808), with each listed source ID checked on its linked official EA individual player page below. The official list and player pages confirm names, Brighton affiliation, stable source IDs, primary positions, and the attributes shown.

The game's canonical position-specific fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a matching named leaf attribute counts as direct evidence. Group summaries such as Passing, Pace, and Defending, composites, and approximate synonyms remain unresolved. In the Dribbling group, the specifically named `Dribbling` leaf is recorded, not the group summary. This audit does not approve an EA-to-game scale or formula mapping.

EA's ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items; they exclude other item types and later live-form updates in other modes. Club affiliations can change. These pages are evidence only for the fields they display.

## Identity and directly observed leaf fields

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. `—` indicates no direct same-name leaf equivalent for that canonical field. Values below are observations only; none was copied into game data.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Bart Verbruggen | GK → GK | 258498 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bart-verbruggen/258498) | `gkDiving` 80; `agility` 52; `strength` 72; `stamina` 40 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Jason Steele | GK → GK | 188836 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jason-steele/188836) | `gkDiving` 74; `agility` 36; `strength` 55; `stamina` 29 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Luka Vušković | DF → CB | 275192 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luka-vuskovic/275192) | `strength` 86; `aggression` 79; `stamina` 77 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Ferdi Kadıoğlu | DF → LB | 235152 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ferdi-kad-oglu/235152) | `strength` 59; `aggression` 62; `stamina` 86 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Mats Wieffer | DF → RB | 248793 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mats-wieffer/248793) | `strength` 72; `aggression` 84; `stamina` 77 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Carlos Baleba | MF → CDM | 272500 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/carlos-baleba/272500) | `crossing` 70; `dribbling` 81; `agility` 75; `stamina` 76 | `passing` (category summary); `speedRating` (Pace summary) |
| Pascal Groß | MF → CDM | 190765 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pascal-gro/190765) | `crossing` 85; `dribbling` 78; `agility` 68; `stamina` 79 | `passing` (category summary); `speedRating` (Pace summary) |
| Yasin Ayari | MF → CDM | 257400 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yasin-ayari/257400) | `crossing` 70; `dribbling` 80; `agility` 79; `stamina` 79 | `passing` (category summary); `speedRating` (Pace summary) |
| Diego Gómez | MF → CM | 269278 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/diego-gomez/269278) | `crossing` 70; `dribbling` 79; `agility` 72; `stamina` 80 | `passing` (category summary); `speedRating` (Pace summary) |
| Kaoru Mitoma | FW → LM | 255565 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kaoru-mitoma/255565) | `shootPower` 73 (EA Shot Power); `dribbling` 85; `agility` 89 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Yankuba Minteh | FW → RM | 271800 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yankuba-minteh/271800) | `shootPower` 72 (EA Shot Power); `dribbling` 86; `agility` 92 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Georginio Rutter | FW → CAM | 245637 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/georginio-rutter/245637) | `shootPower` 79 (EA Shot Power); `dribbling` 80; `agility` 74 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Three EA primary positions fall outside the game's broad ledger roles: Kaoru Mitoma is FW → LM, Yankuba Minteh is FW → RM, and Georginio Rutter is FW → CAM. The other nine fit their broad role (GK; LB/CB/RB; CDM/CM). Exact EA positions are recorded above and were not applied to roster data.

## Result and gate

This batch has **42 of 72** direct same-name leaf observations for its position-specific six-field slots; **30** remain unresolved. The unresolved fields include goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy` and `heading`, and midfield `passing` represented only as an EA group summary. No player in this batch has a complete verified six-stat row under this matching rule.

No EA values were copied into game data or the source ledger. No OVR, tier, rarity, eligibility, or assignment was calculated or changed. EA-to-game field mapping and broad-position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 existing `club26_12` rows and 12 distinct source IDs.
- Prior-batch exclusion: all 12 IDs are unique to this club batch among the 13 existing club reports.
- Source identity: every source ID resolves to the same named player on its direct EA FC27 individual page; the official Brighton team list confirms club context.
- Field accounting: 42 direct leaf observations plus 30 unresolved position-field slots equals 72.
- Safety: documentation-only audit; roster and ledger values, verification flags, and tier assignments are unchanged.
