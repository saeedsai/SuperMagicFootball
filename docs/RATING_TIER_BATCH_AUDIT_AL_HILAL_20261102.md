# Rating-tier source batch audit: Al Hilal (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_afc_2` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each stable FC 27 source ID was checked against its official EA SPORTS individual ratings page and the official [Al Hilal team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/al-hilal/605). All twelve IDs resolve to the listed individuals, whose individual EA pages identify Al Hilal; all twelve names appear on the official team list. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Shooting, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute values are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. Positions outside the existing broad role grouping are documented as discrepancies without changing or normalizing the game positions. “—” means no direct same-name EA leaf for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Yassine Bounou | GK → GK | 209981 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/yassine-bounou/209981) | `gkDiving` 80; `agility` 47; `strength` 69; `stamina` 43 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Mohammed Al Owais | GK → GK | 210923 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mohammed-al-owais/210923) | `gkDiving` 75; `agility` 62; `strength` 62; `stamina` 35 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Rúben Neves | DF → CDM **(discrepancy)** | 224293 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ruben-neves/224293) | `strength` 77; `aggression` 76; `stamina` 91 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Kalidou Koulibaly | DF → CB | 201024 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kalidou-koulibaly/201024) | `strength` 90; `aggression` 83; `stamina` 67 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Theo Hernández | DF → LB | 232656 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/theo-hernandez/232656) | `strength` 82; `aggression` 83; `stamina` 85 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Crysencio Summerville | MF → LM | 251954 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/crysencio-summerville/251954) | `crossing` 74; `dribbling` 82 (leaf); `agility` 91; `stamina` 74 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Mohammed Kanno | MF → CM | 220075 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mohammed-kanno/220075) | `crossing` 65; `dribbling` 75 (leaf); `agility` 72; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Sultan Mandash | MF → RM | 225976 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sultan-mandash/225976) | `crossing` 66; `dribbling` 72 (leaf); `agility` 84; `stamina` 76 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Nasser Al Dawsari | MF → CM | 241938 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nasser-al-dawsari/241938) | `crossing` 73; `dribbling` 67 (leaf); `agility` 79; `stamina` 73 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Sergej Milinković-Savić | FW → CM **(discrepancy)** | 223848 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sergej-milinkovic-savic/223848) | `shootPower` 83; `dribbling` 83 (leaf); `agility` 57 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Karim Benzema | FW → ST | 165153 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/karim-benzema/165153) | `shootPower` 83; `dribbling` 81 (leaf); `agility` 71 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Salem Al Dawsari | FW → LM **(discrepancy)** | 210602 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/salem-al-dawsari/210602) | `shootPower` 73; `dribbling` 84 (leaf); `agility` 86 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Three EA primary positions fall outside the ledger's broad role grouping: Rúben Neves is stored as `DF` but EA lists `CDM`; Sergej Milinković-Savić is stored as `FW` but EA lists `CM`; and Salem Al Dawsari is stored as `FW` but EA lists `LM`. The other nine positions fit their ledger groups, including Crysencio Summerville (`MF`→`LM`). These discrepancies are recorded without changing or normalizing roster positions.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and EA category summaries are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_afc_2` ledger rows and twelve distinct FC 27 source IDs; all twelve identities are present in official individual profiles and the Al Hilal team list.
- Position accounting: 9 broad-position matches and 3 discrepancies (Rúben Neves, Sergej Milinković-Savić, Salem Al Dawsari).
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
