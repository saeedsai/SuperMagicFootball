# Rating-tier source batch audit: Al Ittihad (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_afc_14` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). Each stable FC 27 source ID was checked against its official EA SPORTS individual ratings page and the official [Al Ittihad team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/al-ittihad/607). All twelve IDs resolve to the listed individuals, whose individual EA pages identify Al Ittihad; all twelve names appear on the official team ratings list. No roster data, source-ledger fields, ratings, tiers, identities, or verification flags were changed.

## Source and method

The game's position-specific canonical fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an individually displayed EA leaf attribute whose label directly matches a canonical game field counts as direct evidence. EA category summaries such as Passing, Pace, Shooting, Dribbling, Defending, and Physicality do not count. In the Dribbling group, this audit records the separately labeled `Dribbling` leaf rather than the group heading. EA `Finishing` is not treated as canonical `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`.

EA FC 27 ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items. They exclude other item types and later live-form updates in other modes. Team affiliation may change. OVR and attribute values are observations only; this audit does not infer an EA-to-game scale, formula, or tier.

`Game → EA` shows the ledger's broad primary position followed by EA's specific primary position. Positions outside the existing broad role grouping are documented as discrepancies without changing or normalizing the game positions. “—” means no direct same-name EA leaf for that canonical input.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Unresolved canonical fields |
|---|---|---|---|---|
| Predrag Rajković | GK → GK | 241727 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/predrag-rajkovic/241727) | `gkDiving` 77; `agility` 32; `strength` 66; `stamina` 26 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Mohammed Al Absi | GK → GK | 279593 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mohammed-al-absi/279593) | `gkDiving` 58; `agility` 25; `strength` 56; `stamina` 21 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Danilo Pereira | DF → CB | 200888 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/danilo-pereira/200888) | `strength` 88; `aggression` 81; `stamina` 81 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Dion Lopy | DF → CDM **(discrepancy)** | 259190 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dion-lopy/259190) | `strength` 83; `aggression` 76; `stamina` 79 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Muhannad Al Shanqeeti | DF → RB | 242156 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/muhannad-al-shanqeeti/242156) | `strength` 68; `aggression` 67; `stamina` 80 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Steven Bergwijn | MF → CAM | 225953 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/steven-bergwijn/225953) | `crossing` 76; `dribbling` 83 (leaf); `agility` 77; `stamina` 70 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Roger Fernandes | MF → LM | 263828 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/roger-fernandes/263828) | `crossing` 71; `dribbling` 77 (leaf); `agility` 91; `stamina` 71 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Mahamadou Doumbia | MF → CM | 270613 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mahamadou-doumbia/270613) | `crossing` 59; `dribbling` 82 (leaf); `agility` 87; `stamina` 73 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Hassan Kadish | MF → LB **(discrepancy)** | 210843 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hassan-kadish/210843) | `crossing` 62; `dribbling` 62 (leaf); `agility` 61; `stamina` 88 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Moussa Diaby | FW → RM **(discrepancy)** | 241852 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/moussa-diaby/241852) | `shootPower` 73; `dribbling` 86 (leaf); `agility` 91 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Youssef En-Nesyri | FW → ST | 235410 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/youssef-en-nesyri/235410) | `shootPower` 83; `dribbling` 69 (leaf); `agility` 70 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Houssem Aouar | FW → CAM **(discrepancy)** | 234906 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/houssem-aouar/234906) | `shootPower` 70; `dribbling` 82 (leaf); `agility` 77 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Four EA primary positions fall outside the ledger's broad role grouping: Dion Lopy is stored as `DF` but EA lists `CDM`; Hassan Kadish is stored as `MF` but EA lists `LB`; Moussa Diaby is stored as `FW` but EA lists `RM`; and Houssem Aouar is stored as `FW` but EA lists `CAM`. The other eight positions fit their ledger groups. These discrepancies are recorded without changing or normalizing roster positions.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical position-field slots. No player has all six canonical values directly observed under the conservative matching rule. OVR and EA category summaries are not promoted into game fields. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_afc_14` ledger rows and twelve distinct FC 27 source IDs; all twelve identities are present in official individual profiles and the Al Ittihad team ratings list.
- Position accounting: 8 broad-position matches and 4 documented discrepancies (Dion Lopy, Hassan Kadish, Moussa Diaby, Houssem Aouar).
- Field accounting: 42 direct observations plus 30 unresolved slots equals 72.
- Source-ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
