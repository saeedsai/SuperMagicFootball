# Rating-tier source batch audit: Inter Milan / Lombardia FC (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `club26_8` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The twelve stable FC 27 source IDs were checked against official EA SPORTS individual ratings pages and EA's current [Lombardia FC team ratings list](https://www.ea.com/it/games/ea-sports-fc/ratings/teams-ratings/lombardia-fc/131682). EA's FC 27 display name is “Lombardia FC.” Each individual page reports the matching identity, ID in its canonical URL, primary position, OVR, and Lombardia FC affiliation. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game’s position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose name directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Dribbling, Defending, and Physicality do not count as individual fields. In the Dribbling group, this audit records the explicitly named `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and EA `GK Reflexes` is not treated as canonical `gkSkill`.

EA FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute values are observations only; this audit does not infer an EA-to-game scale, formula, or tier. Pages checked on 2026-11-02.

## Identity and directly observed leaf fields

`Game → EA` shows the ledger’s broad primary position followed by EA’s specific primary position. `—` means no direct same-name EA leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Ivan Provedel | GK → GK | 224987 — [EA player page, OVR 83](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ivan-provedel/224987) | `gkDiving` 81; `agility` 38; `strength` 56; `stamina` 28 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Josep Martínez | GK → GK | 243311 — [EA player page, OVR 76](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/josep-martinez/243311) | `gkDiving` 78; `agility` 32; `strength` 58; `stamina` 42 | `gkSkill` (EA label is GK Reflexes); `passing` (group summary) |
| Alessandro Bastoni | DF → CB | 237383 — [EA player page, OVR 86](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alessandro-bastoni/237383) | `strength` 82; `aggression` 83; `stamina` 78 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Federico Dimarco | DF → LB | 226268 — [EA player page, OVR 86](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/federico-dimarco/226268) | `strength` 65; `aggression` 81; `stamina` 86 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Manuel Akanji | DF → CB | 229237 — [EA player page, OVR 83](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/manuel-akanji/229237) | `strength` 84; `aggression` 84; `stamina` 71 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Nicolò Barella | MF → CM | 224232 — [EA player page, OVR 87](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nicolo-barella/224232) | `crossing` 81; `dribbling` 83 (leaf); `agility` 91; `stamina` 92 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Hakan Çalhanoğlu | MF → CDM | 208128 — [EA player page, OVR 85](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hakan-calhanoglu/208128) | `crossing` 79; `dribbling` 78 (leaf); `agility` 84; `stamina` 78 | `passing` (group summary); `speedRating` (Pace summary) |
| Piotr Zieliński | MF → CM | 210406 — [EA player page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/piotr-zielinski/210406) | `crossing` 73; `dribbling` 82 (leaf); `agility` 78; `stamina` 80 | `passing` (group summary); `speedRating` (Pace summary) |
| Henrikh Mkhitaryan | MF → CM | 192883 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/henrikh-mkhitaryan/192883) | `crossing` 76; `dribbling` 82 (leaf); `agility` 72; `stamina` 74 | `passing` (group summary); `speedRating` (Pace summary) |
| Lautaro Martínez | FW → ST | 231478 — [EA player page, OVR 87](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lautaro-martinez/231478) | `shootPower` 88; `dribbling` 82 (leaf); `agility` 88 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Marcus Thuram | FW → ST | 228093 — [EA player page, OVR 85](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marcus-thuram/228093) | `shootPower` 84; `dribbling` 85 (leaf); `agility` 78 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Yoan Bonny | FW → ST | 259565 — [EA player page, OVR 78](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yoan-bonny/259565) | `shootPower` 77; `dribbling` 79 (leaf); `agility` 80 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancy and result

All twelve EA primary positions fit their ledger’s broad GK, DF, MF, or FW category. The pages list the EA club affiliation as Lombardia FC, which is also the name used in the EA team ratings list linked above. This is an observed source name, not a roster rename.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and attribute values were not copied into game data. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly 12 `club26_8` ledger rows and 12 distinct FC 27 source IDs. The linked official EA pages identify each player and ID; each page lists Lombardia FC affiliation.
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger safety: SHA-256 at audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
