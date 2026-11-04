# Rating-tier source batch audit: Tottenham (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the twelve `club26_29` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Stable FC 27 source player IDs were checked against the official [EA SPORTS FC 27 Spurs ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/spurs/18) and same-name EA individual player pages. No roster or source-ledger data, ratings, tiers, identities, or verification fields were changed.

## Source and method

Canonical inputs are the position-specific fields in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA attribute leaf with the same name as the canonical field counts as direct evidence. Group summaries such as Passing, Pace, Dribbling, Defending, and Physicality do not count. The `Dribbling` leaf displayed with the sub-attributes counts; the broader Dribbling group does not. EA `Finishing` is not treated as `shootAccuracy`, and `Heading Accuracy` is not treated as `heading`.

The team list is used to cross-check club membership, listed primary position, and OVR; individual pages provide the same-name attribute leaves and repeat player identity, team, position, and OVR. EA describes these ratings as Gold, Silver, and Bronze Ultimate Team items available at launch; they do not represent every item type or later live-form updates in other modes. Club affiliations can change. These are source observations only; they do not establish a game scale, formula, or tier mapping.

## Identity and directly observed leaf fields

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. `—` means no directly named EA leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields unresolved |
|---|---|---|---|---|
| Antonín Kinský | GK → GK | 73580 — [EA player page, OVR 77](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/antonin-kinsky/73580) | `gkDiving` 77; `agility` 39; `strength` 60; `stamina` 20 | `gkSkill`; `passing` (EA Passing is a group summary) |
| Martin Dúbravka | GK → GK | 220407 — [EA player page, OVR 77](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/martin-dubravka/220407) | `gkDiving` 77; `agility` 47; `strength` 60; `stamina` 38 | `gkSkill`; `passing` (group summary) |
| Pedro Porro | DF → RB | 243576 — [EA player page, OVR 83](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pedro-porro/243576) | `strength` 66; `aggression` 75; `stamina` 91 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Marcos Senesi | DF → CB | 236506 — [EA player page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marcos-senesi/236506) | `strength` 79; `aggression` 85; `stamina` 75 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Jan Paul van Hecke | DF → CB | 258908 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jan-paul-van-hecke/258908) | `strength` 81; `aggression` 83; `stamina` 74 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Sandro Tonali | MF → CDM | 241096 — [EA player page, OVR 85](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sandro-tonali/241096) | `crossing` 78; `dribbling` 78 (leaf); `agility` 76; `stamina` 89 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| James Maddison | MF → CM | 220697 — [EA player page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/james-maddison/220697) | `crossing` 84; `dribbling` 84 (leaf); `agility` 82; `stamina` 55 | `passing` (group summary); `speedRating` (Pace summary) |
| Mateus Fernandes | MF → CM | 270857 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mateus-fernandes/270857) | `crossing` 77; `dribbling` 80 (leaf); `agility` 84; `stamina` 87 | `passing` (group summary); `speedRating` (Pace summary) |
| Andrew Robertson | MF → LB | 216267 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/andrew-robertson/216267) | `crossing` 83; `dribbling` 76 (leaf); `agility` 67; `stamina` 75 | `passing` (group summary); `speedRating` (Pace summary) |
| Dejan Kulusevski | FW → CM | 247394 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dejan-kulusevski/247394) | `shootPower` 78; `dribbling` 86 (leaf); `agility` 71 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Mohammed Kudus | FW → RM | 245155 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mohammed-kudus/245155) | `shootPower` 81; `dribbling` 88 (leaf); `agility` 86 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Xavi Simons | FW → CAM | 245367 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/xavi-simons/245367) | `shootPower` 78; `dribbling` 85 (leaf); `agility` 86 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies and result

Four EA primary positions fall outside the ledger's broad role: Andrew Robertson is stored as MF but EA lists LB; Dejan Kulusevski is FW but EA lists CM; Mohammed Kudus is FW but EA lists RM; and Xavi Simons is FW but EA lists CAM. The other eight EA positions fit the ledger's broad GK, DF, MF, or FW category. These are source discrepancies only; no roster positions were changed.

This batch has **42 of 72** direct same-name leaf observations, leaving **30** canonical input slots unresolved. No player has a fully observed six-field row under the conservative matching rule. OVRs and attributes above are observations only; no OVR, tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- **Membership and identity:** exactly twelve `club26_29` Tottenham ledger rows and twelve distinct FC 27 source player IDs. Each linked official individual page shows the matching player name, source ID, current Spurs team, EA primary position, and OVR; the linked official Spurs list cross-checks team positions and all twelve OVRs.
- **Field accounting:** 42 direct observations plus 30 unresolved canonical position-field slots equals 72.
- **Source-ledger safety:** SHA-256 before and after this documentation-only audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- **Scope safety:** no roster data or source-ledger fields changed.
