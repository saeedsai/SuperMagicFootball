# Rating-tier source batch audit: AEK Athens (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_uefa_0` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). EA's official FC 27 AEK Athens team page lists the audited players; each linked individual page confirms the player's name, the stable ID in its canonical URL, position, and AEK Athens affiliation. No roster, source-ledger, canonical-stat, identity, tier, or verification-flag values were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed name directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Dribbling, Defending, and Physicality are not individual fields. In Dribbling, this audit records the second, explicitly named `Dribbling` leaf and not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA's FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute observations here do not infer an EA-to-game scale or formula. Pages checked on 2026-11-02.

## Identity and directly observed leaf fields

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. “—” means no direct same-name EA leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Thomas Strakosha | GK → GK | 212151 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/thomas-strakosha/212151) | `gkDiving` 79; `agility` 45; `strength` 75; `stamina` 23 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Alberto Brignoli | GK → GK | 210358 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alberto-brignoli/210358) | `gkDiving` 71; `agility` 50; `strength` 60; `stamina` 34 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Harold Moukoudi | DF → CB | 228732 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/harold-moukoudi/228732) | `strength` 93; `aggression` 85; `stamina` 78 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Filipe Relvas | DF → CB | 263897 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/filipe-relvas/263897) | `strength` 82; `aggression` 73; `stamina` 80 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Lazaros Rota | DF → RB | 255541 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lazaros-rota/255541) | `strength` 70; `aggression` 79; `stamina` 86 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Kaan Kairinen | MF → CM | 232446 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kaan-kairinen/232446) | `crossing` 73; `dribbling` 74 (leaf); `agility` 71; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lovro Majer | MF → CAM | 244261 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lovro-majer/244261) | `crossing` 75; `dribbling` 78 (leaf); `agility` 78; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Oleksandr Zubkov | MF → RM | 237055 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/oleksandr-zubkov/237055) | `crossing` 74; `dribbling` 76 (leaf); `agility` 80; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Răzvan Marin | MF → CM | 235813 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/razvan-marin/235813) | `crossing` 78; `dribbling` 73 (leaf); `agility` 75; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Barnabás Varga | FW → ST | 236510 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/barnabas-varga/236510) | `shootPower` 75; `dribbling` 71 (leaf); `agility` 71 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Luka Jović | FW → ST | 232432 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luka-jovic/232432) | `shootPower` 80; `dribbling` 74 (leaf); `agility` 74 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Aboubakary Koita | FW → LM | 239028 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/aboubakary-koita/239028) | `shootPower` 88; `dribbling` 86 (leaf); `agility` 86 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancy and result

Eleven EA primary positions fit each row's broad GK, DF, MF, or FW category. Aboubakary Koita's EA primary position is LM while the ledger category is FW; this cross-category discrepancy is recorded without changing the roster. All twelve identities and source IDs appear on EA's [AEK Athens FC 27 team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/aek-athens/278).

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical inputs directly observed under this conservative matching rule. OVR and EA group summaries were not copied into game data. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_0` ledger rows and twelve distinct FC 27 source IDs; official EA individual pages and the EA AEK Athens team list agree on identities and club affiliation.
- Position accounting: 11 broad-position matches and 1 cross-category discrepancy.
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Ledger SHA-256 at audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
