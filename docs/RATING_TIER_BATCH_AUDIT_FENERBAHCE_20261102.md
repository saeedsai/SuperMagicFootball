# Rating-tier source batch audit: Fenerbahçe (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_uefa_10` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). EA's official FC 27 Fenerbahçe team ratings page lists the audited players, and each linked individual page confirms the name, stable ID in its canonical URL, position, and club affiliation. No roster, source-ledger, canonical-stat, identity, tier, or verification-flag values were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed name directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Dribbling, Defending, and Physicality are not individual fields. In Dribbling, this audit records the second, explicitly named `Dribbling` leaf and not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA's FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute observations here do not infer an EA-to-game scale or formula. Pages checked on 2026-11-02.

## Identity and directly observed leaf fields

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. “—” means no direct same-name EA leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Ederson | GK → GK | 210257 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ederson/210257) | `gkDiving` 80; `agility` 60; `strength` 78; `stamina` 44 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Dominik Livaković | GK → GK | 241671 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dominik-livakovic/241671) | `gkDiving` 78; `agility` 65; `strength` 75; `stamina` 32 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Milan Škriniar | DF → CB | 232363 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/milan-skriniar/232363) | `strength` 88; `aggression` 83; `stamina` 68 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Nathan Aké | DF → CB | 208920 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nathan-ake/208920) | `strength` 75; `aggression` 78; `stamina` 54 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Diego Carlos | DF → CB | 219693 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/diego-carlos/219693) | `strength` 77; `aggression` 81; `stamina` 39 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| N'Golo Kanté | MF → CDM | 215914 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/n-golo-kante/215914) | `crossing` 68; `dribbling` 78 (leaf); `agility` 79; `stamina` 90 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Marco Asensio | MF → CAM | 220834 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marco-asensio/220834) | `crossing` 81; `dribbling` 83 (leaf); `agility` 79; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Anderson Talisca | MF → CAM | 212523 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/anderson-talisca/212523) | `crossing` 78; `dribbling` 82 (leaf); `agility` 78; `stamina` 73 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Mattéo Guendouzi | MF → CDM | 236496 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matteo-guendouzi/236496) | `crossing` 71; `dribbling` 79 (leaf); `agility` 83; `stamina` 91 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Mason Greenwood | FW → RM | 246147 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mason-greenwood/246147) | `shootPower` 86; `dribbling` 84 (leaf); `agility` 87 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Romelu Lukaku | FW → ST | 192505 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/romelu-lukaku/192505) | `shootPower` 86; `dribbling` 75 (leaf); `agility` 55 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Vedat Muriqi | FW → ST | 223710 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/vedat-muriqi/223710) | `shootPower` 83; `dribbling` 73 (leaf); `agility` 37 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

All twelve EA primary positions fit the ledger's broad GK, DF, MF, or FW category. All twelve identities and source IDs appear in the official [Fenerbahçe FC 27 team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/fenerbahce/326). No position discrepancy was found.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical inputs directly observed under this conservative matching rule. OVR and EA group summaries were not copied into game data. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_10` ledger rows and twelve distinct FC 27 source IDs; official EA individual pages and the EA Fenerbahçe team list agree on identities and club affiliation.
- Position accounting: 12 broad-position matches and zero cross-category discrepancies.
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Ledger SHA-256 before and after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
