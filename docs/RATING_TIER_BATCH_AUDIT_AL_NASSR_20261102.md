# Rating-tier source batch audit: Al Nassr (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_afc_1` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each stable FC 27 source ID was checked against its official EA SPORTS individual ratings page and the official [Al Nassr team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/al-nassr/112139). All twelve source IDs and names resolve to individual EA pages; all twelve names appear in the official team list, and their individual pages identify Al Nassr. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Shooting, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute values are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. A position outside the existing broad role grouping is documented as a discrepancy without changing or normalizing the game position. “—” means no direct same-name EA leaf for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Bento | GK → GK | 73562 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bento/73562) | `gkDiving` 80; `agility` 34; `strength` 58; `stamina` 19 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Nawaf Al Aqidi | GK → GK | 255368 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nawaf-al-aqidi/255368) | `gkDiving` 74; `agility` 45; `strength` 64; `stamina` 29 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Iñigo Martínez | DF → CB | 204525 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/inigo-martinez/204525) | `strength` 85; `aggression` 86; `stamina` 74 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Mohamed Simakan | DF → CB | 243854 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mohamed-simakan/243854) | `strength` 85; `aggression` 81; `stamina` 81 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Abdulelah Al Amri | DF → CB | 241197 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/abdulelah-al-amri/241197) | `strength` 81; `aggression` 85; `stamina` 76 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Sadio Mané | MF → LM | 208722 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sadio-mane/208722) | `crossing` 77; `dribbling` 84 (leaf); `agility` 84; `stamina` 78 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Samú Costa | MF → CDM | 255566 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/samu-costa/255566) | `crossing` 58; `dribbling` 68 (leaf); `agility` 67; `stamina` 86 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Ângelo | MF → CM | 272829 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/angelo/272829) | `crossing` 68; `dribbling` 83 (leaf); `agility` 89; `stamina` 66 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Nawaf Boushal | MF → LB **(discrepancy)** | 254685 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nawaf-boushal/254685) | `crossing` 65; `dribbling` 68 (leaf); `agility` 80; `stamina` 84 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Cristiano Ronaldo | FW → ST | 20801 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/cristiano-ronaldo/20801) | `shootPower` 90; `dribbling` 76 (leaf); `agility` 69 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| João Félix | FW → CAM **(discrepancy)** | 242444 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joao-felix/242444) | `shootPower` 83; `dribbling` 85 (leaf); `agility` 89 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Kingsley Coman | FW → RM **(discrepancy)** | 213345 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kingsley-coman/213345) | `shootPower` 81; `dribbling` 89 (leaf); `agility` 90 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Three EA primary positions fall outside the ledger's broad role grouping: Nawaf Boushal is stored as `MF` but EA lists `LB`; João Félix is stored as `FW` but EA lists `CAM`; and Kingsley Coman is stored as `FW` but EA lists `RM`. The other nine player positions fit the ledger's broad GK, DF, MF, or FW grouping. These source discrepancies are recorded without changing or normalizing roster positions.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and EA category summaries are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_afc_1` ledger rows and twelve distinct FC 27 source IDs; all twelve identities are represented on EA individual pages and the official Al Nassr team list.
- Position accounting: 9 broad-position matches and 3 documented discrepancies (Nawaf Boushal, João Félix, Kingsley Coman).
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
