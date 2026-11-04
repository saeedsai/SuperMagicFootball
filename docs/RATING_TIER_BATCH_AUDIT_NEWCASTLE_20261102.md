# Rating-tier source batch audit: Newcastle United (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_13` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The 12 ledger records have distinct FC27 source IDs and no ID overlaps the twelve previously audited club batches. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

The primary source is the [official EA SPORTS FC 27 Newcastle Utd ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/newcastle-utd/13), with the linked official EA individual player pages below. Names, source IDs, Newcastle Utd affiliation and primary positions were checked on EA's pages.

The game's canonical fields are the position-specific inputs in `data/mechanics/gameplay.json` (`positionOverallStats`). A value is recorded only where EA publishes a matching named leaf attribute. Category summaries such as Passing, Pace and Defending, composites, and approximate synonyms are not direct matches. In the Dribbling category, the specifically named `Dribbling` leaf is recorded; its separate category summary is not. This audit does not approve an EA-to-game scale or formula mapping.

EA's ratings pages cover launch Gold, Silver and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes; club affiliations can change. These pages are evidence only for the fields they publish.

## Identity and directly observed leaf fields

The position column shows the ledger's broad primary position followed by EA's specific primary position. `—` indicates no direct same-name leaf equivalent for that canonical field.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Nick Pope | GK → GK | 203841 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nick-pope/203841) | `gkDiving` 78; `agility` 34; `strength` 71; `stamina` 34 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Lukáš Horníček | GK → GK | 258936 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lukas-hornicek/258936) | `gkDiving` 76; `agility` 38; `strength` 64; `stamina` 21 | `gkSkill`; `passing` (category summary only) |
| Lewis Hall | DF → LB | 266127 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lewis-hall/266127) | `strength` 64; `aggression` 62; `stamina` 78 | `defence` (category summary); `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Fabian Schär | DF → CB | 210047 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/fabian-schar/210047) | `strength` 79; `aggression` 80; `stamina` 65 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Malick Thiaw | DF → CB | 256261 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/malick-thiaw/256261) | `strength` 83; `aggression` 77; `stamina` 76 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Tino Livramento | MF → RB | 262118 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/tino-livramento/262118) | `crossing` 79; `dribbling` 80; `agility` 76; `stamina` 78 | `passing` (category summary); `speedRating` (Pace summary) |
| Joelinton | MF → CM | 223334 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joelinton/223334) | `crossing` 73; `dribbling` 82; `agility` 64; `stamina` 89 | `passing` (category summary); `speedRating` (Pace summary) |
| Anthony Elanga | MF → RW | 257470 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/anthony-elanga/257470) | `crossing` 79; `dribbling` 81; `agility` 85; `stamina` 75 | `passing` (category summary); `speedRating` (Pace summary) |
| Jacob Murphy | MF → RW | 206085 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jacob-murphy/206085) | `crossing` 84; `dribbling` 80; `agility` 74; `stamina` 76 | `passing` (category summary); `speedRating` (Pace summary) |
| Harvey Barnes | FW → LW | 234742 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/harvey-barnes/234742) | `shootPower` 82 (EA Shot Power); `dribbling` 82; `agility` 76 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Nick Woltemade | FW → ST | 254022 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nick-woltemade/254022) | `shootPower` 82 (EA Shot Power); `dribbling` 84; `agility` 69 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Yoane Wissa | FW → ST | 234824 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yoane-wissa/234824) | `shootPower` 82 (EA Shot Power); `dribbling` 78; `agility` 82 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Three EA primary positions fall outside the ledger's broad roles: Tino Livramento is game MF → EA RB; Anthony Elanga is game MF → EA RW; Jacob Murphy is game MF → EA RW. The other nine fit the broad role (GK; LB/CB; CM; LW/ST). These source positions are recorded only as observations and were not applied to the roster.

## Result and gate

This batch has **42 of 72** direct same-name leaf observations for its position-specific six-field slots; **30** remain unresolved. These include goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy` and `heading`, and midfield `passing` represented only as an EA category summary. No player has a complete verified six-stat row under this matching rule.

No EA values were copied into game data or the source ledger. All 12 players remain unverified for canonical game statistics; no OVR, tier, rarity, eligibility or assignment was calculated or changed. Source-to-game mapping and broad-position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 existing `club26_13` ledger rows and 12 distinct source IDs.
- Source identity: each ID resolves to the matching player name on the official EA FC27 individual player page; the official team page confirms Newcastle Utd context.
- Field accounting: 42 direct leaf observations plus 30 unresolved position-field slots equals 72.
- Safety: documentation-only audit; roster and ledger values, verification flags and tier assignments remain unchanged.
