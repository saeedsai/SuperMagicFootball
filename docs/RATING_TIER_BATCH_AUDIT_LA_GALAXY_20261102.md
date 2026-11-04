# Rating-tier source batch audit: LA Galaxy (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_concacaf_12` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each stable FC 27 source ID was checked against its official EA SPORTS individual ratings page and the official [LA Galaxy team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/la-galaxy/697). All twelve IDs resolve to the listed same-name players and all twelve names appear on EA's LA Galaxy list. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Shooting, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages reflect launch Gold, Silver, and Bronze Ultimate Team player items, exclude other item types and later live-form updates in other modes, and note that club affiliations can change. Values below are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger broad position followed by EA's primary position. Positions outside the existing broad role grouping are recorded as discrepancies without changing or normalizing game positions. “—” means no direct same-name EA leaf for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| JT Marcinkowski | GK → GK | 242703 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jt-marcinkowski/242703) | `gkDiving` 65; `agility` 23; `strength` 68; `stamina` 40 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Novak Mićović | GK → GK | 275032 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/novak-micovic/275032) | `gkDiving` 63; `agility` 27; `strength` 57; `stamina` 20 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Jakob Glesnes | DF → CB | 233400 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jakob-glesnes/233400) | `strength` 76; `aggression` 72; `stamina` 91 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Miki Yamane | DF → RB | 233169 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/miki-yamane/233169) | `strength` 70; `aggression` 64; `stamina` 78 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Justin Haak | DF → CB | 247038 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/justin-haak/247038) | `strength` 73; `aggression` 69; `stamina` 65 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Marco Reus | MF → CAM | 188350 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marco-reus/188350) | `crossing` 81; `dribbling` 80 (leaf); `agility` 68; `stamina` 63 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Sergi Roberto | MF → CDM | 199564 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sergi-roberto/199564) | `crossing` 78; `dribbling` 74 (leaf); `agility` 66; `stamina` 59 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Erik Thommy | MF → CAM | 221797 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/erik-thommy/221797) | `crossing` 71; `dribbling` 73 (leaf); `agility` 78; `stamina` 64 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Lucas Sanabria | MF → CDM | 70335 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lucas-sanabria/70335) | `crossing` 55; `dribbling` 64 (leaf); `agility` 62; `stamina` 66 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Hirving Lozano | FW → LW | 221992 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hirving-lozano/221992) | `shootPower` 75; `dribbling` 76 (leaf); `agility` 81 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Riqui Puig | FW → CM **(discrepancy)** | 242816 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/riqui-puig/242816) | `shootPower` 70; `dribbling` 80 (leaf); `agility` 78 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Joseph Paintsil | FW → LM **(discrepancy)** | 241162 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joseph-paintsil/241162) | `shootPower` 69; `dribbling` 76 (leaf); `agility` 93 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Two EA primary positions fall outside the ledger's broad role grouping: Riqui Puig is stored as `FW` but EA lists `CM`; Joseph Paintsil is stored as `FW` but EA lists `LM`. The other ten positions fit their ledger groups. These observations do not change or normalize roster positions.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and EA category summaries are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_concacaf_12` ledger rows and twelve distinct FC 27 source IDs; all twelve identities are present on their EA individual pages and the LA Galaxy team ratings list.
- Position accounting: 10 broad-position matches and 2 documented discrepancies (Riqui Puig, Joseph Paintsil).
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
