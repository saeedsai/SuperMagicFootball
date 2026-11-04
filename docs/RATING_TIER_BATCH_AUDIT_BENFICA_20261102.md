# Rating-tier source batch audit: SL Benfica (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_16` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The 12 records have distinct FC27 source IDs and do not overlap any of the sixteen previously documented club batches. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

The primary source is the [official EA SPORTS FC 27 SL Benfica ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/sl-benfica/234), with each source ID checked on its official EA individual player page below. The team list and individual pages were used to confirm names, Benfica affiliation, stable source IDs, primary positions, and attributes shown.

The game's canonical position-specific fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a matching named leaf attribute counts as direct evidence. Group summaries such as Passing, Pace, and Defending, composites, and approximate synonyms remain unresolved. In the Dribbling group, the specifically named `Dribbling` leaf is recorded, not the group summary. This audit does not approve an EA-to-game scale or formula mapping.

EA's ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items; they exclude other item types and later live-form updates in other modes. Club affiliations can change. These pages are evidence only for the fields they display.

## Identity and directly observed leaf fields

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. `—` indicates no direct same-name leaf equivalent for that canonical field. Values below are observations only; none was copied into game data.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Anatoliy Trubin | GK → GK | 250753 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/anatoliy-trubin/250753) | `gkDiving` 77; `agility` 36; `strength` 69; `stamina` 33 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Samuel Soares | GK → GK | 270060 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/samuel-soares/270060) | `gkDiving` 69; `agility` 57; `strength` 75; `stamina` 33 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Alexander Bah | DF → RB | 245235 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alexander-bah/245235) | `strength` 78; `aggression` 83; `stamina` 80 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Tomás Araújo | DF → CB | 266096 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/tomas-araujo/266096) | `strength` 83; `aggression` 73; `stamina` 75 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Clément Lenglet | DF → CB | 220440 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/clement-lenglet/220440) | `strength` 79; `aggression` 75; `stamina` 67 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Rafa | MF → CAM | 216547 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rafa/216547) | `crossing` 78; `dribbling` 84; `agility` 89; `stamina` 77 | `passing` (category summary); `speedRating` (Pace summary) |
| Dodi Lukébakio | MF → RW | 231416 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dodi-lukebakio/231416) | `crossing` 75; `dribbling` 84; `agility` 80; `stamina` 71 | `passing` (category summary); `speedRating` (Pace summary) |
| Georgiy Sudakov | MF → CAM | 259913 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/georgiy-sudakov/259913) | `crossing` 75; `dribbling` 81; `agility` 80; `stamina` 79 | `passing` (category summary); `speedRating` (Pace summary) |
| Richard Ríos | MF → CM | 262881 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/richard-rios/262881) | `crossing` 74; `dribbling` 80; `agility` 84; `stamina` 89 | `passing` (category summary); `speedRating` (Pace summary) |
| Vangelis Pavlidis | FW → ST | 229188 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/vangelis-pavlidis/229188) | `shootPower` 83 (EA Shot Power); `dribbling` 81; `agility` 76 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Fredrik Aursnes | FW → CM | 231913 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/fredrik-aursnes/231913) | `shootPower` 75 (EA Shot Power); `dribbling` 79; `agility` 80 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Andreas Schjelderup | FW → LW | 260952 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/andreas-schjelderup/260952) | `shootPower` 74 (EA Shot Power); `dribbling` 83; `agility` 85 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Two EA primary positions fall outside the game's broad ledger roles: Dodi Lukébakio is MF → RW and Fredrik Aursnes is FW → CM. The other ten fit their broad roles (GK; RB/CB; CAM/CM; ST/LW). Exact EA positions are recorded above and were not applied to roster data.

## Result and gate

This batch has **42 of 72** direct same-name leaf observations for its position-specific six-field slots; **30** remain unresolved. The unresolved fields include goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy` and `heading`, and midfield `passing` represented only as an EA group summary. No player in this batch has a complete verified six-stat row under this matching rule.

No EA values were copied into game data or the source ledger. No OVR, tier, rarity, eligibility, or assignment was calculated or changed. EA-to-game field mapping and broad-position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 existing `club26_16` rows and 12 distinct source IDs.
- Prior-batch exclusion: all 12 IDs are unique to this club batch among the sixteen existing club reports.
- Source identity: every source ID resolves to the same named player on an official EA FC27 individual page; the official SL Benfica team list confirms club context.
- Field accounting: 42 direct leaf observations plus 30 unresolved position-field slots equals 72.
- Safety: documentation-only audit; roster and ledger values, verification flags, and tier assignments are unchanged.
