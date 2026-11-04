# Rating-tier source batch audit: Galatasaray (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_uefa_12` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each stable FC 27 source ID was checked against an official EA SPORTS individual ratings page and EA's current [Galatasaray team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/galatasaray/325). The official team list and individual pages identify each ledger player and source ID as a Galatasaray player. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute values are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. “—” means no direct same-name EA leaf for that canonical input. Under the same broad mapping used by prior batch audits, LM/RM are midfielder positions, not FW.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Uğurcan Çakır | GK → GK | 226300 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ugurcan-cak-r/226300) | `gkDiving` 80; `agility` 64; `strength` 69; `stamina` 42 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Günay Güvenç | GK → GK | 211908 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gunay-guvenc/211908) | `gkDiving` 72; `agility` 59; `strength` 68; `stamina` 37 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Davinson Sánchez | DF → CB | 220793 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/davinson-sanchez/220793) | `strength` 88; `aggression` 85; `stamina` 84 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Abdülkerim Bardakcı | DF → CB | 229905 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/abdulkerim-bardakc/229905) | `strength` 87; `aggression` 84; `stamina` 82 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Roland Sallai | DF → RB | 234171 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/roland-sallai/234171) | `strength` 74; `aggression` 77; `stamina` 82 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Lucas Torreira | MF → CDM | 223959 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lucas-torreira/223959) | `crossing` 71; `dribbling` 72 (leaf); `agility` 81; `stamina` 91 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Gabriel Sara | MF → CM | 270571 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gabriel-sara/270571) | `crossing` 82; `dribbling` 80 (leaf); `agility` 79; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Yunus Akgün | MF → CAM | 239892 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yunus-akgun/239892) | `crossing` 70; `dribbling` 81 (leaf); `agility` 89; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| İlkay Gündoğan | MF → CM | 186942 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ilkay-gundogan/186942) | `crossing` 77; `dribbling` 80 (leaf); `agility` 59; `stamina` 61 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Victor Osimhen | FW → ST | 232293 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/victor-osimhen/232293) | `shootPower` 86; `dribbling` 78 (leaf); `agility` 75 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Barış Alper Yılmaz | FW → LM | 263205 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bar-s-alper-y-lmaz/263205) | `shootPower` 86; `dribbling` 79 (leaf); `agility` 86 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Leroy Sané | FW → RM | 222492 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/leroy-sane/222492) | `shootPower` 87; `dribbling` 83 (leaf); `agility` 87 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Ten of twelve EA primary positions fit the ledger's broad GK, DF, MF, or FW category. Barış Alper Yılmaz is listed as `LM` and Leroy Sané as `RM`, while both ledger rows are `FW`; both are cross-category discrepancies under the broad-position mapping. The discrepancies are recorded only; no positions or team entries were changed.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and other EA category summaries are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_12` ledger rows and twelve distinct FC 27 source IDs; the official EA team list confirms Galatasaray and lists the batch's player identities.
- Position accounting: 10 broad-position matches and 2 cross-category discrepancies.
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
