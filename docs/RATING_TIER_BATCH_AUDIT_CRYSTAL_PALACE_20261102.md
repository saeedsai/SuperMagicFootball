# Rating-tier source batch audit: Crystal Palace (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_24` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each ledger source ID was checked against the matching official EA SPORTS FC 27 individual player page and the official [Crystal Palace ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/crystal-palace/1799). No roster or source-ledger data, ratings, tiers, identities, or verification fields were changed.

## Source and method

Canonical game fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a same-named, individually displayed EA leaf attribute counts as direct evidence. EA group summaries such as Passing, Pace, Dribbling, Defending, and Physicality do not count as leaves. For Dribbling, the audit records the separately displayed Dribbling attribute leaf, not the group heading. EA `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and Pace is not treated as `speedRating`.

The EA table reflects Gold, Silver, and Bronze Ultimate Team player items available at launch. Other item types and later live-form updates in other modes are excluded; club affiliations may change. Its OVR and attribute values are observations only and do not establish a game scale, formula, or tier mapping.

## Identity and directly observed leaf fields

`Game → EA` gives the ledger's broad primary position followed by EA's specific primary position. `—` means there is no directly named EA leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields unresolved |
|---|---|---|---|---|
| Dean Henderson | GK → GK | 233306 — [EA page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dean-henderson/233306) | `gkDiving` 83; `agility` 61; `strength` 64; `stamina` 32 | `gkSkill`; `passing` (Passing is a group summary) |
| Walter Benítez | GK → GK | 215223 — [EA page, OVR 78](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/walter-benitez/215223) | `gkDiving` 78; `agility` 45; `strength` 80; `stamina` 40 | `gkSkill`; `passing` (group summary) |
| Daniel Muñoz | DF → RB | 237646 — [EA page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/daniel-munoz/237646) | `strength` 69; `aggression` 83; `stamina` 88 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Chris Richards | DF → CB | 250954 — [EA page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/chris-richards/250954) | `strength` 81; `aggression` 78; `stamina` 72 | `defence` (group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Mingueza | DF → RB | 259694 — [EA page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mingueza/259694) | `strength` 72; `aggression` 75; `stamina` 82 | `defence` (group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Adam Wharton | MF → CM | 259240 — [EA page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/adam-wharton/259240) | `crossing` 83; `dribbling` 79 (leaf); `agility` 71; `stamina` 70 | `passing` (group summary); `speedRating` (Pace summary) |
| Daichi Kamada | MF → CM | 232730 — [EA page, OVR 79](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/daichi-kamada/232730) | `crossing` 75; `dribbling` 80 (leaf); `agility` 75; `stamina` 73 | `passing` (group summary); `speedRating` (Pace summary) |
| Tyrick Mitchell | MF → LB | 240947 — [EA page, OVR 79](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/tyrick-mitchell/240947) | `crossing` 77; `dribbling` 72 (leaf); `agility` 76; `stamina` 92 | `passing` (group summary); `speedRating` (Pace summary) |
| Anan Khalaili | MF → RM | 70888 — [EA page, OVR 78](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/anan-khalaili/70888) | `crossing` 76; `dribbling` 81 (leaf); `agility` 80; `stamina` 83 | `passing` (group summary); `speedRating` (Pace summary) |
| Ismaïla Sarr | FW → RW | 235353 — [EA page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ismaila-sarr/235353) | `shootPower` 83; `dribbling` 80 (leaf); `agility` 73 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Jean-Philippe Mateta | FW → ST | 236461 — [EA page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jean-philippe-mateta/236461) | `shootPower` 86; `dribbling` 80 (leaf); `agility` 53 | `shootAccuracy` (Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Yeremy Pino | FW → LW | 259377 — [EA page, OVR 79](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yeremy-pino/259377) | `shootPower` 73; `dribbling` 83 (leaf); `agility` 81 | `shootAccuracy` (Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies and result

Tyrick Mitchell is stored as broad-position MF while EA lists LB. The other eleven primary positions fit their ledger broad role. This is recorded as a source discrepancy only; no roster positions were changed.

The batch has **42 of 72** direct same-name leaf observations, leaving **30** canonical input slots unresolved. No player has a fully observed six-field row under the conservative matching rule. OVR and attribute values are source observations only. No OVR, tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `club26_24` ledger rows and twelve distinct FC 27 source IDs. Each matching official EA page shows the source ID's player name and Crystal Palace affiliation; the official team ratings list independently includes these twelve players and their listed OVRs.
- Field accounting: 42 direct observations plus 30 unresolved position-field slots equals 72.
- Source-ledger safety: SHA-256 before and after this documentation-only audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
