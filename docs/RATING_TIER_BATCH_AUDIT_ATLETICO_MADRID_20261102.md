# Rating-tier source batch audit: Atlético de Madrid (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only review of existing `club26_19` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). All twelve ledger source IDs were checked against official EA SPORTS FC 27 individual player pages. No player data, source-ledger fields, ratings, tiers, identities or verification flags were changed.

## Method

The game’s canonical position-specific inputs are in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a directly displayed, same-named EA leaf attribute is counted as source evidence. EA group summaries such as Passing, Pace, Dribbling, Defending and Physicality are not treated as equivalent to the game’s individual inputs. `Heading Accuracy` is not treated as the game field `heading`; it is a distinct source label. The audit does not approve an EA-to-game scale or formula mapping.

The EA pages cover FC 27 launch Gold, Silver and Bronze Ultimate Team items, not every later item or live-form update. Club affiliations can change. These pages establish only the listed identity, current EA position/team, OVR and displayed attributes.

## Identity and direct observations

| Ledger player | Game → EA position | EA source ID and official page | Direct same-name canonical fields | Unresolved canonical fields |
|---|---|---|---|---|
| Jan Oblak | GK → GK | 200389 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jan-oblak/200389), OVR 88 | `gkDiving` 85; `agility` 64; `strength` 78; `stamina` 42 | `gkSkill`; `passing` (EA Passing is a group summary) |
| Juan Musso | GK → GK | 214979 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/juan-musso/214979), OVR 82 | `gkDiving` 80; `agility` 32; `strength` 70; `stamina` 35 | `gkSkill`; `passing` (group summary) |
| Marcos Llorente | DF → RB | 226161 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marcos-llorente/226161), OVR 85 | `strength` 78; `aggression` 81; `stamina` 93 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Grimaldo | DF → LM | 210035 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/grimaldo/210035), OVR 85 | `strength` 53; `aggression` 69; `stamina` 86 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Dávid Hancko | DF → CB | 247103 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/david-hancko/247103), OVR 83 | `strength` 87; `aggression` 81; `stamina` 79 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Álex Baena | MF → LM | 257279 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alex-baena/257279), OVR 83 | `crossing` 86; `dribbling` 82 (leaf); `agility` 81; `stamina` 78 | `passing` (group summary); `speedRating` (Pace summary) |
| Morten Hjulmand | MF → CDM | 244669 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/morten-hjulmand/244669), OVR 83 | `crossing` 72; `dribbling` 76 (leaf); `agility` 70; `stamina` 91 | `passing` (group summary); `speedRating` (Pace summary) |
| Pablo Barrios | MF → CM | 272449 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pablo-barrios/272449), OVR 83 | `crossing` 66; `dribbling` 83 (leaf); `agility` 80; `stamina` 87 | `passing` (group summary); `speedRating` (Pace summary) |
| Giuliano | MF → RM | 253396 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/giuliano/253396), OVR 82 | `crossing` 78; `dribbling` 80 (leaf); `agility` 85; `stamina` 91 | `passing` (group summary); `speedRating` (Pace summary) |
| Julián Alvarez | FW → ST | 246191 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/julian-alvarez/246191), OVR 86 | `shootPower` 88; `dribbling` 87 (leaf); `agility` 87 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Ademola Lookman | FW → ST | 230899 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ademola-lookman/230899), OVR 83 | `shootPower` 86; `dribbling` 84 (leaf); `agility` 89 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Alexander Sørloth | FW → ST | 216549 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alexander-s-rloth/216549), OVR 83 | `shootPower` 86; `dribbling` 74 (leaf); `agility` 56 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

All twelve IDs resolve to the same named FC 27 player and each page identifies Atlético de Madrid. Game broad-role discrepancy: Grimaldo is stored as DF but EA lists LM. This is recorded as a source discrepancy only; the game roster was not changed.

## Result and data safety

This batch contains **42 of 72** direct same-name leaf observations; **30** canonical inputs remain unresolved. No player has a complete six-input row under this conservative rule. EA OVR/headline attributes are observations only and were not copied into game data or the source ledger. No tiers, rarity, eligibility or assignments were calculated or changed.

Membership validation confirms exactly twelve `club26_19` rows and twelve distinct FC27 source IDs. The source-ledger SHA-256 remained `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`; there were no ledger writes.
