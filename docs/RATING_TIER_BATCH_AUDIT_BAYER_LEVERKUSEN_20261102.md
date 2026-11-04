# Rating-tier source batch audit: Bayer Leverkusen (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only review of existing `club26_20` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). All twelve ledger source IDs were checked against official EA SPORTS FC 27 individual player pages. No player data, source-ledger fields, ratings, tiers, identities or verification flags were changed.

## Method

The game’s canonical position-specific inputs are in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a directly displayed, same-named EA leaf attribute is counted as source evidence. EA group summaries such as Passing, Pace, Dribbling, Defending and Physicality are not treated as equivalent to the game’s individual inputs. `Heading Accuracy` is not treated as the game field `heading`; it is a distinct source label. The audit does not approve an EA-to-game scale or formula mapping.

The EA pages cover FC 27 launch Gold, Silver and Bronze Ultimate Team items, not every later item or live-form update. Club affiliations can change. These pages establish only the listed identity, current EA position/team, OVR and displayed attributes.

## Identity and direct observations

| Ledger player | Game → EA position | EA source ID and official page | Direct same-name canonical fields | Unresolved canonical fields |
|---|---|---|---|---|
| Mark Flekken | GK → GK | 211738 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mark-flekken/211738), OVR 77 | `gkDiving` 78; `agility` 34; `strength` 72; `stamina` 28 | `gkSkill`; `passing` (EA Passing is a group summary) |
| Janis Blaswich | GK → GK | 204092 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/janis-blaswich/204092), OVR 74 | `gkDiving` 76; `agility` 31; `strength` 74; `stamina` 31 | `gkSkill`; `passing` (group summary) |
| Edmond Tapsoba | DF → CB | 247263 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/edmond-tapsoba/247263), OVR 82 | `strength` 84; `aggression` 77; `stamina` 74 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Miguel Gutiérrez | DF → LB | 261865 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/miguel-gutierrez/261865), OVR 80 | `strength` 61; `aggression` 73; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Facundo Medina | DF → CB | 236804 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/facundo-medina/236804), OVR 79 | `strength` 81; `aggression` 84; `stamina` 78 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Aleix García | MF → CM | 228813 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/aleix-garcia/228813), OVR 84 | `crossing` 83; `dribbling` 84 (leaf); `agility` 87; `stamina` 81 | `passing` (group summary); `speedRating` (Pace summary) |
| Exequiel Palacios | MF → CM | 231521 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/exequiel-palacios/231521), OVR 83 | `crossing` 70; `dribbling` 82 (leaf); `agility` 78; `stamina` 68 | `passing` (group summary); `speedRating` (Pace summary) |
| Ibrahim Maza | MF → CAM | 275029 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ibrahim-maza/275029), OVR 80 | `crossing` 70; `dribbling` 87 (leaf); `agility` 85; `stamina` 83 | `passing` (group summary); `speedRating` (Pace summary) |
| Nathan Tella | MF → RM | 237328 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nathan-tella/237328), OVR 78 | `crossing` 74; `dribbling` 82 (leaf); `agility` 87; `stamina` 78 | `passing` (group summary); `speedRating` (Pace summary) |
| Patrik Schick | FW → ST | 234236 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/patrik-schick/234236), OVR 83 | `shootPower` 85; `dribbling` 81 (leaf); `agility` 76 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Malik Tillman | FW → CAM | 256853 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/malik-tillman/256853), OVR 79 | `shootPower` 80; `dribbling` 81 (leaf); `agility` 75 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Afonso Moreira | FW → LM | 276901 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/afonso-moreira/276901), OVR 78 | `shootPower` 77; `dribbling` 79 (leaf); `agility` 78 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

All twelve IDs resolve to the same named FC 27 player and each page identifies Leverkusen. Game broad-role discrepancies: Malik Tillman and Afonso Moreira are stored as FW but EA lists CAM and LM. This is recorded as a source discrepancy only; the game roster was not changed.

## Result and data safety

This batch contains **42 of 72** direct same-name leaf observations; **30** canonical inputs remain unresolved. No player has a complete six-input row under this conservative rule. EA OVR/headline attributes are observations only and were not copied into game data or the source ledger. No tiers, rarity, eligibility or assignments were calculated or changed.

Membership validation confirms exactly twelve `club26_20` rows and twelve distinct FC27 source IDs. The source-ledger SHA-256 remained `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`; there were no ledger writes.
