# Rating-tier source batch audit: Napoli (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `club26_25` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The twelve stable source IDs were checked against official EA SPORTS FC 27 individual ratings pages and the [official SSC Napoli team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/ssc-napoli/48). No roster data, source-ledger fields, ratings, tiers, identities or verification flags were changed.

## Source and method

The game’s position-specific canonical fields are in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose name directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Dribbling, Defending, and Physicality are not counted as individual fields. In the Dribbling group, the second, explicitly named `Dribbling` leaf is recorded, not the group summary. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`.

The EA FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. The OVR and attributes recorded below are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

## Identity and direct same-name leaf observations

`Game → EA` shows the ledger’s broad primary position followed by EA’s specific primary position. `—` indicates no direct same-name EA leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Alex Meret | GK → GK | 225116 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alex-meret/225116) | `gkDiving` 78; `agility` 46; `strength` 65; `stamina` 29 | `gkSkill`; `passing` (EA Passing is a group summary) |
| Vanja Milinković-Savić | GK → GK | 224836 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/vanja-milinkovic-savic/224836) | `gkDiving` 79; `agility` 38; `strength` 73; `stamina` 33 | `gkSkill`; `passing` (group summary) |
| Amir Rrahmani | DF → CB | 244263 — [EA player page, OVR 83](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/amir-rrahmani/244263) | `strength` 83; `aggression` 81; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Giovanni Di Lorenzo | DF → RB | 217870 — [EA player page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/giovanni-di-lorenzo/217870) | `strength` 75; `aggression` 79; `stamina` 89 | `defence` (group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Alessandro Buongiorno | DF → CB | 243241 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alessandro-buongiorno/243241) | `strength` 82; `aggression` 83; `stamina` 81 | `defence` (group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Scott McTominay | MF → CM | 237238 — [EA player page, OVR 86](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/scott-mc-tominay/237238) | `crossing` 66; `dribbling` 84 (leaf); `agility` 70; `stamina` 92 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Kevin De Bruyne | MF → CAM | 192985 — [EA player page, OVR 85](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kevin-de-bruyne/192985) | `crossing` 89; `dribbling` 84 (leaf); `agility` 67; `stamina` 61 | `passing` (group summary); `speedRating` (Pace summary) |
| Stanislav Lobotka | MF → CM | 216435 — [EA player page, OVR 83](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/stanislav-lobotka/216435) | `crossing` 75; `dribbling` 80 (leaf); `agility` 78; `stamina` 86 | `passing` (group summary); `speedRating` (Pace summary) |
| André-Franck Zambo Anguissa | MF → CM | 227236 — [EA player page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/andre-franck-zambo-anguissa/227236) | `crossing` 64; `dribbling` 81 (leaf); `agility` 74; `stamina` 76 | `passing` (group summary); `speedRating` (Pace summary) |
| David Neres | FW → LW | 236632 — [EA player page, OVR 81](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/david-neres/236632) | `shootPower` 79; `dribbling` 84 (leaf); `agility` 92 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Matteo Politano | FW → RW | 216409 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matteo-politano/216409) | `shootPower` 78; `dribbling` 83 (leaf); `agility` 89 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Noa Lang | FW → LM | 239380 — [EA player page, OVR 79](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/noa-lang/239380) | `shootPower` 74; `dribbling` 84 (leaf); `agility` 87 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies and result

Three EA primary positions are outside the ledger’s broad role: David Neres is stored as FW but EA lists LW; Matteo Politano is stored as FW but EA lists RW; Noa Lang is stored as FW but EA lists LM. The other nine positions fit the ledger’s broad GK, DF, or MF roles. The discrepancy records are observational only; no game positions were changed.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under this matching rule. OVR and attribute values were not copied to game data. No tier, rarity, eligibility or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly 12 `club26_25` ledger rows and 12 distinct source IDs; all 12 linked EA pages display the matching identity, FC 27 position and OVR, and identify current club SSC Napoli. The team ratings list confirms the current roster context.
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger safety: SHA-256 before and after this documentation-only audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
