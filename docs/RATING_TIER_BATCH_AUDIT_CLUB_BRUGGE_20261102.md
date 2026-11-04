# Rating-tier source batch audit: Club Brugge (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only review of existing `club26_21` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). All twelve ledger source IDs were checked against official EA SPORTS FC 27 individual player pages. No player data, source-ledger fields, ratings, tiers, identities or verification flags were changed.

## Method

The game's canonical position-specific inputs are in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a directly displayed, same-named EA leaf attribute is counted as source evidence. EA group summaries such as Passing, Pace, Dribbling, Defending and Physicality are not treated as equivalent to the game's individual inputs. `Heading Accuracy` is not treated as the game field `heading`; it is a distinct source label. The audit does not approve an EA-to-game scale or formula mapping.

The EA pages cover FC 27 launch Gold, Silver and Bronze Ultimate Team items, not every later item or live-form update. Club affiliations can change. These pages establish only the listed identity, current EA position/team, OVR and displayed attributes.

## Identity and direct observations

| Ledger player | Game → EA position | EA source ID and official page | Direct same-name canonical fields | Unresolved canonical fields |
|---|---|---|---|---|
| Yann Sommer | GK → GK | 177683 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yann-sommer/177683), OVR 84 | `gkDiving` 80; `agility` 57; `strength` 68; `stamina` 45 | `gkSkill`; `passing` (EA Passing is a group summary) |
| Nordin Jackers | GK → GK | 222263 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nordin-jackers/222263), OVR 70 | `gkDiving` 69; `agility` 48; `strength` 51; `stamina` 28 | `gkSkill`; `passing` (group summary) |
| Brandon Mechele | DF → CB | 212204 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/brandon-mechele/212204), OVR 78 | `strength` 82; `aggression` 72; `stamina` 80 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Joel Ordoñez | DF → CB | 268611 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joel-ordonez/268611), OVR 76 | `strength` 86; `aggression` 76; `stamina` 72 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Joaquin Seys | DF → LB | 71305 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joaquin-seys/71305), OVR 74 | `strength` 67; `aggression` 64; `stamina` 72 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Hans Vanaken | MF → CAM | 200155 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hans-vanaken/200155), OVR 81 | `crossing` 78; `dribbling` 80 (leaf); `agility` 63; `stamina` 91 | `passing` (group summary); `speedRating` (Pace summary) |
| Félix Lemaréchal | MF → CAM | 264869 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/felix-lemarechal/264869), OVR 73 | `crossing` 71; `dribbling` 76 (leaf); `agility` 68; `stamina` 71 | `passing` (group summary); `speedRating` (Pace summary) |
| Freddie Potts | MF → CDM | 264579 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/freddie-potts/264579), OVR 73 | `crossing` 69; `dribbling` 68 (leaf); `agility` 75; `stamina` 78 | `passing` (group summary); `speedRating` (Pace summary) |
| Kyriani Sabbe | MF → RB | 275050 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kyriani-sabbe/275050), OVR 72 | `crossing` 74; `dribbling` 70 (leaf); `agility` 74; `stamina` 77 | `passing` (group summary); `speedRating` (Pace summary) |
| Jan Virgili | FW → LW | 80915 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jan-virgili/80915), OVR 76 | `shootPower` 68; `dribbling` 81 (leaf); `agility` 85 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Nicolò Tresoldi | FW → ST | 266895 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nicolo-tresoldi/266895), OVR 75 | `shootPower` 70; `dribbling` 75 (leaf); `agility` 71 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Carlos Forbs | FW → RM | 277426 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/carlos-forbs/277426), OVR 75 | `shootPower` 69; `dribbling` 76 (leaf); `agility` 84 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

All twelve IDs resolve to the same named FC 27 player and each page identifies Club Brugge. Game broad-role discrepancies: Kyriani Sabbe is stored as MF but EA lists RB; this is recorded as a source discrepancy only, and the game roster was not changed.

## Result and data safety

This batch contains **42 of 72** direct same-name leaf observations; **30** canonical inputs remain unresolved. No player has a complete six-input row under this conservative rule. EA OVR/headline attributes are observations only and were not copied into game data or the source ledger. No tiers, rarity, eligibility or assignments were calculated or changed.

Membership validation confirms exactly twelve `club26_21` rows and twelve distinct FC27 source IDs. The source-ledger SHA-256 remained `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`; there were no ledger writes.
