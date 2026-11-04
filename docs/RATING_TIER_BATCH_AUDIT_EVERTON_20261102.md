# Rating-tier source batch audit: Everton (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_27` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The twelve stable FC 27 source IDs were checked against official EA SPORTS individual player pages and Everton's official ratings list. No roster or source-ledger data, ratings, tiers, identities, or verification fields were changed.

## Source and method

The primary sources are the official [EA SPORTS FC 27 Everton ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/everton/7) and the individual ratings pages in the table. Canonical game fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a same-named, individually displayed EA leaf attribute counts as direct evidence. Group summaries such as Passing, Pace, Dribbling, Defending, and Physicality do not count as a leaf. For Dribbling, this audit records the named Dribbling attribute leaf rather than the group heading. EA `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`.

EA ratings pages cover Gold, Silver, and Bronze Ultimate Team player items available at launch; other item types and later live-form updates in other modes are excluded. Club affiliations can change. Values here are observations only and do not establish a game scale, formula, or tier mapping.

## Identity and directly observed leaf fields

`Game → EA` gives the ledger's broad primary position followed by EA's specific primary position. `—` means no directly named EA leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields unresolved |
|---|---|---|---|---|
| Jordan Pickford | GK → GK | 204935 — [EA player page, OVR 85](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jordan-pickford/204935) | `gkDiving` 84; `agility` 59; `strength` 72; `stamina` 40 | `gkSkill`; `passing` (EA Passing is a group summary) |
| Mark Travers | GK → GK | 232284 — [EA player page, OVR 72](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mark-travers/232284) | `gkDiving` 73; `agility` 39; `strength` 60; `stamina` 30 | `gkSkill`; `passing` (group summary) |
| James Garner | DF → CDM | 243657 — [EA player page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/james-garner/243657) | `strength` 70; `aggression` 80; `stamina` 88 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| James Tarkowski | DF → CB | 202695 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/james-tarkowski/202695) | `strength` 90; `aggression` 89; `stamina` 68 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Jarrad Branthwaite | DF → CB | 247649 — [EA player page, OVR 79](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jarrad-branthwaite/247649) | `strength` 82; `aggression` 75; `stamina` 65 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Kiernan Dewsbury-Hall | MF → CAM | 237386 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kiernan-dewsbury-hall/237386) | `crossing` 79; `dribbling` 80 (leaf); `agility` 79; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Christian Nørgaard | MF → CDM | 210697 — [EA player page, OVR 79](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/christian-n-rgaard/210697) | `crossing` 73; `dribbling` 69 (leaf); `agility` 61; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Hayden Hackney | MF → CM | 253054 — [EA player page, OVR 77](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hayden-hackney/253054) | `crossing` 63; `dribbling` 77 (leaf); `agility` 73; `stamina` 85 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Vitaliy Mykolenko | MF → LB | 244380 — [EA player page, OVR 77](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/vitaliy-mykolenko/244380) | `crossing` 74; `dribbling` 70 (leaf); `agility` 66; `stamina` 84 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Iliman Ndiaye | FW → LM | 261188 — [EA player page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/iliman-ndiaye/261188) | `shootPower` 78; `dribbling` 89 (leaf); `agility` 84 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Brennan Johnson | FW → RW | 251421 — [EA player page, OVR 78](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/brennan-johnson/251421) | `shootPower` 74; `dribbling` 77 (leaf); `agility` 77 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Beto | FW → ST | 251892 — [EA player page, OVR 77](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/beto/251892) | `shootPower` 84; `dribbling` 73 (leaf); `agility` 51 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies and result

Three EA primary positions fall outside the ledger's broad role: James Garner is stored DF but EA lists CDM; Vitaliy Mykolenko is stored MF but EA lists LB; and Iliman Ndiaye is stored FW but EA lists LM. The other nine positions fit the ledger's broad GK, DF, MF, or FW category. These are recorded as source discrepancies only; no roster positions were changed.

The batch has **42 of 72** direct same-name leaf observations, leaving **30** canonical input slots unresolved. No player has a fully observed six-field row under the conservative matching rule. OVR and attribute values are observations only. No OVR, tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `club26_27` ledger rows and twelve distinct FC 27 source IDs. Each linked official page shows the matching player name, source ID, current Everton team, EA primary position, and OVR.
- Field accounting: 42 direct observations plus 30 unresolved position-field slots equals 72.
- Source-ledger safety: SHA-256 before and after this documentation-only audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
