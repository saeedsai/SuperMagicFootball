# Rating-tier source batch audit: Arsenal (12 players)

**Audit date:** 2026-11-01  
**Scope:** read-only source verification against the existing `club26_0` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

Arsenal was selected because all 12 current `club26_0` player rows have an explicit FC27 source-player ID, a recorded official check date, and the same official EA Arsenal ratings source. Each ID was opened as an individual EA player page and checked against the ledger name and source position. The team page is [EA SPORTS FC 27 Arsenal Player Ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/arsenal/1).

The game's canonical fields are the position-specific inputs in `data/mechanics/gameplay.json` (`positionOverallStats`). For this audit, a source value is listed only where the official individual page supplies a matching, named leaf attribute. Category summaries (such as Passing, Pace, or Defending), derived combinations, and approximate synonyms are not treated as direct matches. This is source evidence only: it does not approve a mapping from EA's ratings system to SuperMagicFootball's stat scale.

EA's pages are authoritative for the fields they publish on the EA SPORTS FC 27 Ultimate Team launch-player pages. Their scope note says those values are launch Gold/Silver/Bronze Ultimate Team items and excludes other item types and later live-form updates. They do not establish that EA and SuperMagicFootball use interchangeable scales or formulas.

## Player identity and directly observed leaf fields

Values below are transcribed from the linked EA individual page. The source ID is the ID already recorded in the matching ledger row. `—` means that the corresponding SuperMagicFootball canonical field has no direct same-name leaf value under the method above; it is intentionally left unresolved.

| Ledger player | Position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---:|---|---|---|
| David Raya | GK | 220901 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/david-raya/220901) | `gkDiving` 87; `agility` 68; `strength` 43; `stamina` 31 | `gkSkill`; `passing` (EA page's Passing is a category summary, not a leaf field) |
| Kepa | GK | 206585 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kepa/206585) | `gkDiving` 77; `agility` 45; `strength` 55; `stamina` 35 | `gkSkill`; `passing` (category summary only) |
| Gabriel | DF | 232580 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gabriel/232580) | `strength` 89; `aggression` 89; `stamina` 71 | `defence` (EA Defending is a category summary); `speedRating` (Pace is a category summary); `heading` (EA labels its leaf Heading Accuracy) |
| William Saliba | DF | 243715 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/william-saliba/243715) | `strength` 86; `aggression` 82; `stamina` 72 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Ezri Konsa | DF | 227678 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ezri-konsa/227678) | `strength` 79; `aggression` 80; `stamina` 79 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Declan Rice | MF | 234378 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/declan-rice/234378) | `crossing` 90; `dribbling` 81; `agility` 65; `stamina` 94 | `passing` (category summary); `speedRating` (Pace summary) |
| Bruno Guimarães | MF | 247851 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bruno-guimaraes/247851) | `crossing` 80; `dribbling` 85; `agility` 73; `stamina` 90 | `passing` (category summary); `speedRating` (Pace summary) |
| Martin Ødegaard | MF | 222665 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/martin-degaard/222665) | `crossing` 85; `dribbling` 87; `agility` 83; `stamina` 77 | `passing` (category summary); `speedRating` (Pace summary) |
| Zubimendi | MF | 248148 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/zubimendi/248148) | `crossing` 76; `dribbling` 79; `agility` 74; `stamina` 85 | `passing` (category summary); `speedRating` (Pace summary) |
| Bukayo Saka | FW | 246669 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bukayo-saka/246669) | `shootPower` 80 (EA Shot Power); `dribbling` 86; `agility` 85 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Viktor Gyökeres | FW | 241651 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/viktor-gyokeres/241651) | `shootPower` 90 (EA Shot Power); `dribbling` 78; `agility` 67 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Eberechi Eze | FW | 235794 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/eberechi-eze/235794) | `shootPower` 81 (EA Shot Power); `dribbling` 87; `agility` 87 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Result and gate

The source pages provide **42 of 72** same-name leaf-field observations for the current position-specific six-field slots. The remaining **30 slots** lack a direct leaf equivalent in this source set, including goalkeeper `gkSkill`, defensive `defence`, `speedRating`, striker `shootAccuracy`, and `heading`; the `passing` canonical input is represented only as EA's grouped Passing summary on these pages. The evidence therefore does not support a fully verified six-stat row for any player in this batch.

The observations are preserved here as source evidence, not copied into the roster or ledger's derived canonical candidates. All 12 rows remain unverified for canonical game stats; no OVR, tier, rarity, ability eligibility, or assignment was calculated or changed. The exact source-to-game mapping and accepted source snapshot policy remain open.

## Focused audit validation

- Batch membership: exactly 12 `club26_0` rows; all 12 have unique, non-empty EA IDs, a check date, and the official Arsenal page URL in the ledger.
- Page cross-check: all 12 source IDs resolve to the named player pages linked above, with names and listed positions consistent with the batch roster.
- Field accounting: 42 direct same-name leaf observations plus 30 explicitly unresolved position-field slots = 72; every source is an EA-owned `ea.com` player rating page.
- Safety: this is a documentation-only audit. No game roster data or source-ledger values were edited, and no tier was assigned.
