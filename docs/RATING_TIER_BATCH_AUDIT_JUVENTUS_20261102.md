# Rating-tier source batch audit: Juventus (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `club26_28` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The stable FC 27 source IDs were checked against official EA SPORTS individual ratings pages and the [official Juventus team ratings list](https://www.ea.com/it/games/ea-sports-fc/ratings/teams-ratings/juventus/45). No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute with the same canonical field name counts as direct evidence. EA group summaries such as Passing, Pace, Dribbling, Defending, and Physicality do not count as leaves. When the EA page shows a Dribbling category and a separate Dribbling leaf, this audit records the latter. EA `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`.

EA's Italian pages localize some position and attribute labels: POR=GK, DC=CB, TS=LB, CDC=CDM, CC=CM, ES=LM, MOC=CAM, ATT=ST. OVR and position were confirmed against the Juventus team list. EA FC 27 ratings show launch Gold, Silver, and Bronze Ultimate Team player items, excluding other item types and later live-form updates in other modes. Club affiliations can change. The values below are observations only; they do not establish an EA-to-game scale, formula, or tier mapping.

## Identity and direct same-name leaf observations

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. `—` means no direct same-name leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Guglielmo Vicario | GK → GK | 240091 — [EA player page, OVR 80](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/guglielmo-vicario/240091) | `gkDiving` 79; `agility` 56; `strength` 60; `stamina` 38 | `gkSkill`; `passing` (EA Passing is a group summary) |
| Michele Di Gregorio | GK → GK | 235840 — [EA player page, OVR 80](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/michele-di-gregorio/235840) | `gkDiving` 81; `agility` 55; `strength` 68; `stamina` 36 | `gkSkill`; `passing` (group summary) |
| Bremer | DF → CB | 239580 — [EA player page, OVR 86](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/bremer/239580) | `strength` 89; `aggression` 86; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Pierre Kalulu | DF → CB | 255654 — [EA player page, OVR 81](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/pierre-kalulu/255654) | `strength` 74; `aggression` 80; `stamina` 87 | `defence` (group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Andrea Cambiaso | DF → LB | 258966 — [EA player page, OVR 80](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/andrea-cambiaso/258966) | `strength` 68; `aggression` 68; `stamina` 83 | `defence` (group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Manuel Locatelli | MF → CDM | 222077 — [EA player page, OVR 84](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/manuel-locatelli/222077) | `crossing` 73; `dribbling` 75 (leaf); `agility` 61; `stamina` 90 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Khéphren Thuram | MF → CM | 247246 — [EA player page, OVR 81](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/khephren-thuram/247246) | `crossing` 72; `dribbling` 81 (leaf); `agility` 70; `stamina` 87 | `passing` (group summary); `speedRating` (Pace summary) |
| Weston McKennie | MF → CM | 238744 — [EA player page, OVR 80](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/weston-mc-kennie/238744) | `crossing` 78; `dribbling` 79 (leaf); `agility` 73; `stamina` 87 | `passing` (group summary); `speedRating` (Pace summary) |
| Nico González | MF → LM | 240690 — [EA player page, OVR 79](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/nico-gonzalez/240690) | `crossing` 75; `dribbling` 79 (leaf); `agility` 82; `stamina` 76 | `passing` (group summary); `speedRating` (Pace summary) |
| Kenan Yıldız | FW → CAM | 277954 — [EA player page, OVR 84](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/kenan-y-ld-z/277954) | `shootPower` 80; `dribbling` 86 (leaf); `agility` 83 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Jonathan David | FW → ST | 243630 — [EA player page, OVR 80](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/jonathan-david/243630) | `shootPower` 79; `dribbling` 78 (leaf); `agility` 77 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Francisco Conceição | FW → CAM | 261050 — [EA player page, OVR 80](https://www.ea.com/it/games/ea-sports-fc/ratings/player-ratings/francisco-conceicao/261050) | `shootPower` 76; `dribbling` 86 (leaf); `agility` 94 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies and result

Two EA primary positions are outside the ledger's broad role: Kenan Yıldız and Francisco Conceição are stored as FW while EA lists CAM. The other ten positions fit the ledger's broad GK, DF, MF, or FW categories. These are observational discrepancies only; no game positions were changed.

The batch has **42 of 72** direct same-name leaf observations, leaving **30** canonical position-field slots unresolved. No player has all six canonical values directly observed under the conservative matching rule. OVR and attribute values are observations only; no OVR, tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `club26_28` ledger rows and twelve distinct FC 27 source IDs. Each linked EA individual page matches the stable source ID and player identity; the official Juventus list confirms the listed current club, position, and OVR.
- Field accounting: 42 direct observations plus 30 unresolved position-field slots equals 72.
- Source-ledger safety: SHA-256 before and after this documentation-only audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
