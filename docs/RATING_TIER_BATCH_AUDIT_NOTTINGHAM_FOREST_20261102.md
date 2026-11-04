# Rating-tier source batch audit: Nottingham Forest (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only review of existing `club26_17` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). All twelve ledger source IDs were checked against official EA SPORTS FC 27 individual player pages. No player data, source-ledger fields, ratings, tiers, identities or verification flags were changed.

## Method

The game’s canonical position-specific inputs are in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a directly displayed, same-named EA leaf attribute is counted as source evidence. EA group summaries such as Passing, Pace, Dribbling, Defending and Physicality are not treated as equivalent to the game’s individual inputs. `Heading Accuracy` is not treated as the game field `heading`; it is a distinct source label. The audit does not approve an EA-to-game scale or formula mapping.

The EA pages cover FC 27 launch Gold, Silver and Bronze Ultimate Team items, not every later item or live-form update. Club affiliations can change. These pages establish only the listed identity, current EA position/team, OVR and displayed attributes.

## Identity and direct observations

| Ledger player | Game → EA position | EA source ID and official page | Direct same-name canonical fields | Unresolved canonical fields |
|---|---|---|---|---|
| John Victor | GK → GK | 234724 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/john-victor/234724), OVR 71 | `gkDiving` 74; `agility` 25; `strength` 69; `stamina` 19 | `gkSkill`; `passing` (EA Passing is a group summary) |
| Matz Sels | GK → GK | 199641 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matz-sels/199641), OVR 81 | `gkDiving` 82; `agility` 36; `strength` 65; `stamina` 26 | `gkSkill`; `passing` (group summary) |
| Murillo | DF → CB | 278016 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/murillo/278016), OVR 82 | `strength` 90; `aggression` 81; `stamina` 70 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Ousmane Diomande | DF → CB | 270531 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ousmane-diomande/270531), OVR 81 | `strength` 92; `aggression` 85; `stamina` 80 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Neco Williams | DF → LB | 243057 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/neco-williams/243057), OVR 80 | `strength` 64; `aggression` 75; `stamina` 85 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Morgan Gibbs-White | MF → CAM | 236015 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/morgan-gibbs-white/236015), OVR 83 | `crossing` 81; `dribbling` 85 (leaf); `agility` 83; `stamina` 86 | `passing` (group summary); `speedRating` (Pace summary) |
| Ibrahim Sangaré | MF → CDM | 235173 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ibrahim-sangare/235173), OVR 78 | `crossing` 66; `dribbling` 74 (leaf); `agility` 54; `stamina` 69 | `passing` (group summary); `speedRating` (Pace summary) |
| Nicolás Domínguez | MF → CDM | 237819 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nicolas-dominguez/237819), OVR 78 | `crossing` 73; `dribbling` 74 (leaf); `agility` 82; `stamina` 78 | `passing` (group summary); `speedRating` (Pace summary) |
| Xaver Schlager | MF → CDM | 233195 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/xaver-schlager/233195), OVR 78 | `crossing` 59; `dribbling` 76 (leaf); `agility` 73; `stamina` 77 | `passing` (group summary); `speedRating` (Pace summary) |
| Chris Wood | FW → ST | 192123 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/chris-wood/192123), OVR 81 | `shootPower` 84; `dribbling` 71 (leaf); `agility` 49 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Arnaud Kalimuendo | FW → ST | 253444 — [EA page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/arnaud-kalimuendo/253444), OVR 78 | `shootPower` 80; `dribbling` 79 (leaf); `agility` 78 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Callum Hudson-Odoi | FW → LM | 240740 — [EA page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/callum-hudson-odoi/240740), OVR 78 | `shootPower` 78; `dribbling` 82 (leaf); `agility` 76 | `shootAccuracy` (Shooting/Finishing labels differ); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

All twelve IDs resolve to the same named FC 27 player, and every page identifies Nott'm Forest. The three game broad roles align with the EA positions: both GKs are GK; the three DFs are CB/CB/LB; the four MFs are CAM/CDM/CDM/CDM; and the three FWs are ST/ST/LM.

## Result and data safety

This batch contains **42 of 72** direct same-name leaf observations; **30** canonical inputs remain unresolved. No player has a complete six-input row under this conservative rule. EA OVR/headline attributes are observations only and were not copied into game data or the source ledger. No tiers, rarity, eligibility or assignments were calculated or changed.

Membership validation confirms exactly twelve `club26_17` rows and twelve distinct FC27 source IDs. The source-ledger SHA-256 remained `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`; there were no ledger writes.
