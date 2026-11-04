# Rating-tier source batch audit: AC Milan / Milano FC (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `club26_30` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The twelve stable FC 27 source IDs were checked against official EA SPORTS individual ratings pages and EA's current [Milano FC team ratings list](https://www.ea.com/it/games/ea-sports-fc/ratings/teams-ratings/milano-fc/131681). EA currently names the team “Milano FC.” No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game’s position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose name directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Dribbling, Defending, and Physicality do not count as individual fields. In the Dribbling group, this audit records the explicitly named `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`.

EA FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute values are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

## Identity and directly observed leaf fields

`Game → EA` shows the ledger’s broad primary position followed by EA’s specific primary position. `—` means no direct same-name EA leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Mike Maignan | GK → GK | 215698 — [EA player page, OVR 87](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mike-maignan/215698) | `gkDiving` 83; `agility` 65; `strength` 83; `stamina` 39 | `gkSkill` (EA uses GK Reflexes); `passing` (EA Passing is a group summary) |
| Pietro Terracciano | GK → GK | 205812 — [EA player page, OVR 76](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pietro-terracciano/205812) | `gkDiving` 76; `agility` 48; `strength` 60; `stamina` 33 | `gkSkill` (EA uses GK Reflexes); `passing` (group summary) |
| Mario Gila | DF → CB | 268804 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mario-gila/268804) | `strength` 74; `aggression` 84; `stamina` 85 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Alexis Saelemaekers | DF → RB | 242664 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alexis-saelemaekers/242664) | `strength` 46; `aggression` 69; `stamina` 86 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Fikayo Tomori | DF → CB | 232756 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/fikayo-tomori/232756) | `strength` 79; `aggression` 86; `stamina` 76 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Adrien Rabiot | MF → CM | 210008 — [EA player page, OVR 85](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/adrien-rabiot/210008) | `crossing` 78; `dribbling` 81 (leaf); `agility` 70; `stamina` 91 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Luka Modrić | MF → CM | 177003 — [EA player page, OVR 85](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luka-modric/177003) | `crossing` 86; `dribbling` 83 (leaf); `agility` 89; `stamina` 74 | `passing` (group summary); `speedRating` (Pace summary) |
| Youssouf Fofana | MF → CM | 245630 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/youssouf-fofana/245630) | `crossing` 66; `dribbling` 79 (leaf); `agility` 70; `stamina` 80 | `passing` (group summary); `speedRating` (Pace summary) |
| Diego Moreira | MF → RM | 270039 — [EA player page, OVR 79](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/diego-moreira/270039) | `crossing` 75; `dribbling` 85 (leaf); `agility` 86; `stamina` 85 | `passing` (group summary); `speedRating` (Pace summary) |
| Rafael Leão | FW → LW | 241721 — [EA player page, OVR 83](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rafael-leao/241721) | `shootPower` 80; `dribbling` 83 (leaf); `agility` 84 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Christian Pulisic | FW → CAM | 227796 — [EA player page, OVR 83](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/christian-pulisic/227796) | `shootPower` 81; `dribbling` 83 (leaf); `agility` 90 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Christopher Nkunku | FW → ST | 232411 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/christopher-nkunku/232411) | `shootPower` 84; `dribbling` 80 (leaf); `agility` 82 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancy and result

One EA primary position falls outside the ledger’s broad role: Christian Pulisic is stored as FW but EA lists CAM. The other eleven positions fit the ledger’s broad GK, DF, MF, or FW category. This is recorded as a source discrepancy only; no roster positions were changed.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and attribute values were not copied into game data. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly 12 `club26_30` ledger rows and 12 distinct FC 27 source IDs. The linked official EA pages show each matching player identity, source ID, position, OVR, and Milano FC affiliation; the team list confirms all 12 are listed.
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger safety: SHA-256 before and after this documentation-only audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
