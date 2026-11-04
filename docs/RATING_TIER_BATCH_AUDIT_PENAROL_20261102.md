# Rating-tier source batch audit: Peñarol (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_3` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using each row's stable `fc27_source_player_id`. EA's official [Peñarol FC 27 team ratings list](https://www.ea.com/es/games/ea-sports-fc/ratings/teams-ratings/penarol/101110) and individual FC 27 player pages were used to confirm identities, positions and club affiliation. No roster, ledger, game, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. This conservative same-name rule leaves some available sub-attributes unresolved. No EA-to-game conversion or formula is inferred. The ratings pages describe launch FC 27 Gold, Silver and Bronze Ultimate Team items; they exclude other item types and later live-form updates. Sources checked on 2026-11-02.

## Identity and directly observed canonical fields

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

| Ledger player | Game → EA position | FC 27 source ID and official EA page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Washington Aguerre | GK → GK | 253847 — [EA player page](https://careers.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/washington-aguerre/253847) | `gkDiving` 69; `agility` 56; `strength` 71; `stamina` 43 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Sebastián Britos | GK → GK | 227154 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sebastian-britos/227154) | `gkDiving` 66; `agility` 32; `strength` 66; `stamina` 27 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Diego Laxalt | DF → LB | 213400 — [EA player page](https://careers.ea.com/es/games/ea-sports-fc/ratings/player-ratings/diego-laxalt/213400) | `strength` 57; `aggression` 76; `stamina` 75 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Lucas Ferreira | DF → CB | 274046 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/lucas-ferreira/274046) | `strength` 87; `aggression` 70; `stamina` 65 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Nahuel Herrera | DF → CB | 274949 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/nahuel-herrera/274949) | `strength` 74; `aggression` 64; `stamina` 69 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Leonardo Fernández | MF → CAM | 252935 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/leonardo-fernandez/252935) | `crossing` 74; `dribbling` 75 (leaf); `agility` 82; `stamina` 64 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Jesús Trindade | MF → CDM | 253275 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jesus-trindade/253275) | `crossing` 73; `dribbling` 60 (leaf); `agility` 70; `stamina` 77 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Nicolás Fernández | MF → CM | 253304 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/nicolas-fernandez/253304) | `crossing` 59; `dribbling` 71 (leaf); `agility` 76; `stamina` 83 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Eric Remedi | MF → CDM | 228838 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/eric-remedi/228838) | `crossing` 51; `dribbling` 59 (leaf); `agility` 47; `stamina` 68 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Abel Hernández | FW → ST | 188484 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/abel-hernandez/188484) | `shootPower` 76; `dribbling` 68 (leaf); `agility` 76 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Matías Arezo | FW → ST | 254653 — [EA player page](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/matias-arezo/254653) | `shootPower` 79; `dribbling` 68 (leaf); `agility` 78 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Luis Miguel Angulo | FW → LM | 277517 — [EA player page](https://careers.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/luis-miguel-angulo/277517) | `shootPower` 68; `dribbling` 78 (leaf); `agility` 75 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

Eleven EA primary positions fit the ledger's broad GK, DF, MF or FW category. Luis Miguel Angulo's EA primary position is LM while the ledger position is FW; this cross-category discrepancy is recorded without modifying the roster. The official Peñarol team list includes all twelve audited names and links to the corresponding stable-ID pages.

This batch has **42 of 72** direct same-name canonical-field observations and **30** unresolved canonical-field slots. No player has all six position inputs directly observed under this conservative matching rule. OVR and EA category summaries were not copied into game data. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_3` ledger rows and twelve distinct `fc27_source_player_id` values; the official EA team list and linked individual pages corroborate names, IDs, and club affiliation.
- Position accounting: 11 broad-position matches and 1 cross-category discrepancy.
- Field accounting: 42 direct leaves plus 30 unresolved slots equals 72.
- Ledger SHA-256 before and after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster, ledger, game, tier, backlog, or shared index data changed.
