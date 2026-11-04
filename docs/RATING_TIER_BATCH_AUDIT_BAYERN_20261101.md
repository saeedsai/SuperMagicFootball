# Rating-tier source batch audit: Bayern Munich (12 players)

**Audit date:** 2026-11-01  
**Scope:** read-only source verification against the existing `club26_1` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

Bayern Munich was selected as the next 12-player `club26` batch after Arsenal. All 12 `club26_1` ledger rows have an explicit FC27 source-player ID and a recorded official-check date. The official team listing is [EA SPORTS FC 27 FC Bayern München Player Ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/fc-bayern-munchen/21). Each ID below was checked against an individual EA page for player name, source position, and published attribute details.

The game's canonical fields are the position-specific inputs in `data/mechanics/gameplay.json` (`positionOverallStats`). As in the [Arsenal batch audit](RATING_TIER_BATCH_AUDIT_ARSENAL_20261101.md), only same-name leaf attributes count as field evidence. Group summaries such as Passing, Pace, or Defending, composites, and approximate synonyms are left unresolved. This is source evidence, not approval that EA ratings map to SuperMagicFootball's stat scale or formula.

EA's ratings pages describe the values as launch Gold/Silver/Bronze Ultimate Team items and exclude other item types and later live-form updates. They are authoritative for the EA fields displayed, not proof of interchangeable stat scales.

## Player identity and directly observed leaf fields

`Game → EA` lists the current ledger primary position and the EA page's primary position. Values are transcribed from the EA individual page. `—` means no direct same-name leaf value for that canonical field; no value is inferred.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Manuel Neuer | GK → GK | 167495 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/manuel-neuer/167495) | `gkDiving` 80; `agility` 51; `strength` 80; `stamina` 43 | `gkSkill`; `passing` (EA page's Passing is a category summary) |
| Jonas Urbig | GK → GK | 263887 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jonas-urbig/263887) | `gkDiving` 79; `agility` 39; `strength` 51; `stamina` 24 | `gkSkill`; `passing` (category summary only) |
| Joshua Kimmich | DF → CDM | 212622 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joshua-kimmich/212622) | `strength` 69; `aggression` 88; `stamina` 92 | `defence` (EA Defending is a category summary); `speedRating` (Pace is a category summary); `heading` (EA labels its leaf Heading Accuracy) |
| Dayot Upamecano | DF → CB | 229558 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dayot-upamecano/229558) | `strength` 86; `aggression` 89; `stamina` 73 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Jonathan Tah | DF → CB | 213331 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jonathan-tah/213331) | `strength` 91; `aggression` 85; `stamina` 76 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Jamal Musiala | MF → CAM | 256790 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jamal-musiala/256790) | `crossing` 70; `dribbling` 92; `agility` 94; `stamina` 73 | `passing` (category summary); `speedRating` (Pace summary) |
| Konrad Laimer | MF → RB | 225375 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/konrad-laimer/225375) | `crossing` 79; `dribbling` 74; `agility` 76; `stamina` 84 | `passing` (category summary); `speedRating` (Pace summary) |
| Ismael Saibari | MF → CAM | 259480 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ismael-saibari/259480) | `crossing` 72; `dribbling` 84; `agility` 76; `stamina` 90 | `passing` (category summary); `speedRating` (Pace summary) |
| Aleksandar Pavlović | MF → CDM | 275298 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/aleksandar-pavlovic/275298) | `crossing` 77; `dribbling` 81; `agility` 75; `stamina` 85 | `passing` (category summary); `speedRating` (Pace summary) |
| Harry Kane | FW → ST | 202126 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/harry-kane/202126) | `shootPower` 92 (EA Shot Power); `dribbling` 80; `agility` 67 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Michael Olise | FW → RM | 247827 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/michael-olise/247827) | `shootPower` 78 (EA Shot Power); `dribbling` 92; `agility` 91 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Luis Díaz | FW → LM | 241084 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luis-diaz/241084) | `shootPower` 86 (EA Shot Power); `dribbling` 88; `agility` 88 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

The official pages and game primary-position labels disagree for four records: Kimmich is `DF` in the game ledger but `CDM` at EA; Laimer is ledger `MF` but EA `RB`; Olise is ledger `FW` but EA `RM`; Luis Díaz is ledger `FW` but EA `LM` (the page also lists `ST` as an alternate position). These differences are recorded without changing or normalizing the game positions. The EA position labels do not resolve the source-to-game position policy.

## Result and gate

The EA pages provide **42 of 72** same-name leaf-field observations for the current position-specific six-field slots. The remaining **30 slots** lack a direct leaf equivalent in this source set, including goalkeeper `gkSkill`, defensive `defence`, `speedRating`, striker `shootAccuracy`, and `heading`; the `passing` canonical input is represented only as EA's grouped Passing summary on these pages. The source-position discrepancies above are additional unresolved mapping questions. No complete six-stat row is verified for any player in this batch.

These observations remain in this audit only. No EA value was copied into the roster or source ledger; all 12 records remain unverified for canonical game stats. No OVR, tier, rarity, ability eligibility, or assignment was calculated or changed. Field mapping, source snapshot policy, and position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 `club26_1` rows; all 12 have unique, non-empty EA IDs and an official check date.
- Page cross-check: all 12 source IDs resolve to the linked official EA individual pages, with names consistent with the ledger; page positions are transcribed separately from game positions.
- Field accounting: 42 direct same-name leaf observations plus 30 explicitly unresolved position-field slots = 72; all cited sources are EA-owned `ea.com` player pages.
- Safety: this is a documentation-only audit. No game roster data or source-ledger values were edited, and no tier was assigned.
