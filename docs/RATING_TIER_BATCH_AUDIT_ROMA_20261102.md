# Rating-tier source batch audit: Roma (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_22` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). All twelve stable FC 27 source IDs were checked on official EA SPORTS individual ratings pages. The observations below were not copied into roster or ledger data; no player, rating, tier, identity or verification field was changed.

## Source and method

The primary sources are the official [EA SPORTS FC 27 AS Roma ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/as-roma/52) and the individual player pages linked in the table. The game’s canonical position-specific inputs are in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a directly displayed EA leaf with the same name as a canonical input counts as direct evidence. EA category summaries such as Passing, Pace, Dribbling, Defending and Physicality are not treated as individual fields. For Dribbling, the separate attribute leaf named `Dribbling` is recorded, not the group summary. `Finishing` and `Heading Accuracy` are not treated as equivalent to canonical `shootAccuracy` and `heading`.

The EA ratings pages represent launch Gold, Silver and Bronze Ultimate Team items; they exclude other item types and later live-form updates in other modes. Club affiliation can change. EA OVR and attribute values here are source observations only, not a recommendation for an OVR formula, game-scale conversion, or tier.

## Identity and directly observed leaf fields

`Game → EA` gives the ledger’s broad primary position followed by EA’s specific primary position. `—` means that this row has no direct same-name leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields unresolved |
|---|---|---|---|---|
| Mile Svilar | GK → GK | 230872 — [EA player page, OVR 85](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mile-svilar/230872) | `gkDiving` 79; `agility` 66; `strength` 61; `stamina` 32 | `gkSkill`; `passing` (EA Passing is a group summary) |
| Pierluigi Gollini | GK → GK | 211515 — [EA player page, OVR 74](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pierluigi-gollini/211515) | `gkDiving` 74; `agility` 56; `strength` 68; `stamina` 40 | `gkSkill`; `passing` (group summary) |
| Gianluca Mancini | DF → CB | 229582 — [EA player page, OVR 84](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gianluca-mancini/229582) | `strength` 79; `aggression` 87; `stamina` 85 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Evan Ndicka | DF → CB | 236403 — [EA player page, OVR 83](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/evan-ndicka/236403) | `strength` 82; `aggression` 86; `stamina` 84 | `defence` (group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Mario Hermoso | DF → CB | 229668 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mario-hermoso/229668) | `strength` 81; `aggression` 82; `stamina` 76 | `defence` (group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Bryan Cristante | MF → CM | 208268 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bryan-cristante/208268) | `crossing` 74; `dribbling` 78 (leaf); `agility` 58; `stamina` 92 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Kouadio Manu Koné | MF → CM | 250723 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kouadio-manu-kone/250723) | `crossing` 69; `dribbling` 84 (leaf); `agility` 79; `stamina` 82 | `passing` (group summary); `speedRating` (Pace summary) |
| Wesley | MF → LB | 80170 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/wesley/80170) | `crossing` 76; `dribbling` 79 (leaf); `agility` 90; `stamina` 81 | `passing` (group summary); `speedRating` (Pace summary) |
| Lorenzo Pellegrini | MF → CAM | 228251 — [EA player page, OVR 78](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lorenzo-pellegrini/228251) | `crossing` 76; `dribbling` 76 (leaf); `agility` 77; `stamina` 77 | `passing` (group summary); `speedRating` (Pace summary) |
| Paulo Dybala | FW → CAM | 211110 — [EA player page, OVR 85](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/paulo-dybala/211110) | `shootPower` 84; `dribbling` 84 (leaf); `agility` 86 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Donyell Malen | FW → ST | 231447 — [EA player page, OVR 83](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/donyell-malen/231447) | `shootPower` 84; `dribbling` 84 (leaf); `agility` 88 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Matías Soulé | FW → CAM | 265695 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matias-soule/265695) | `shootPower` 76; `dribbling` 80 (leaf); `agility` 85 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies and result

Three FC 27 primary positions fall outside the ledger’s broad role: Wesley is stored as MF but EA lists LB; Paulo Dybala and Matías Soulé are stored as FW but EA lists CAM. The remaining nine primary positions fit the ledger’s broad GK, DF, MF or FW categories. These discrepancies are recorded as evidence only; the roster was not edited.

This batch has **42 of 72** direct same-name leaf observations; **30** canonical input slots remain unresolved. No player has a fully observed six-field position-specific row under this conservative rule. OVR and all values shown are observations only. No rating, tier, rarity, eligibility or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly 12 existing `club26_22` ledger rows and 12 distinct FC 27 source IDs; each linked official EA player page displays the matching name and ID and identifies AS Roma.
- Field accounting: 42 direct observations plus 30 unresolved position-field slots equals 72.
- Source-ledger safety: SHA-256 before and after this documentation-only audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
