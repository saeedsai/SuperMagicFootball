# Rating-tier source batch audit: Al Qadsiah (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_afc_3` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using each row's stable `fc27_source_player_id`. EA's official [Al Qadsiah FC 27 team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/al-qadsiah/112391) and individual FC 27 player pages were used to check player identity, position and club. No roster, ledger, game, tier, or verification values were changed.

## Source and method

Canonical position fields are from `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf with a displayed label directly matching a canonical input counts as direct field evidence. EA category summaries, including Pace, Passing, Dribbling, Defending and Physicality, are not individual fields. For Dribbling, the second leaf explicitly labeled “Dribbling” is recorded rather than the category heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. This conservative rule leaves some available sub-attributes unresolved. No EA-to-game scale or formula is inferred. EA's ratings pages describe launch FC 27 Gold, Silver and Bronze Ultimate Team items; they exclude other item types and later live-form updates. Sources checked on 2026-11-02.

## Identity and directly observed canonical fields

`Game → EA` shows the ledger's broad position followed by EA's specific primary position. “Unresolved” means no qualifying directly matching EA leaf was observed for the canonical field.

| Ledger player | Game → EA position | FC 27 source ID and official EA page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Koen Casteels | GK → GK | 192984 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/koen-casteels/192984) | `gkDiving` 82; `agility` 50; `strength` 72; `stamina` 44 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Ahmed Al Kassar | GK → GK | 209027 — [EA player page](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/ahmed-al-kassar/209027) | `gkDiving` 62; `agility` 36; `strength` 56; `stamina` 35 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Nacho Fernández | DF → CB | 200724 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nacho-fernandez/200724) | `strength` 83; `aggression` 80; `stamina` 70 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Nahitan Nández | DF → CM | 230965 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nahitan-nandez/230965) | `strength` 77; `aggression` 89; `stamina` 92 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Souffian El Karouani | DF → LB | 262473 — [EA player page](https://careers.ea.com/es/games/ea-sports-fc/ratings/player-ratings/souffian-el-karouani/262473) | `strength` 66; `aggression` 75; `stamina` 81 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Tijjani Reijnders | MF → CM | 240638 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/tijjani-reijnders/240638) | `crossing` 73; `dribbling` 84 (leaf); `agility` 71; `stamina` 88 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Otávio | MF → CM | 210411 — [EA player page](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/otavio/210411) | `crossing` 79; `dribbling` 83 (leaf); `agility` 89; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Julian Weigl | MF → CDM | 222028 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/julian-weigl/222028) | `crossing` 59; `dribbling` 71 (leaf); `agility` 72; `stamina` 82 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Musab Al Juwair | MF → CM | 263824 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/musab-al-juwair/263824) | `crossing` 81; `dribbling` 74 (leaf); `agility` 73; `stamina` 85 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Julián Quiñones | FW → ST | 234579 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/julian-quinones/234579) | `shootPower` 84; `dribbling` 83 (leaf); `agility` 85 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Mateo Retegui | FW → ST | 241850 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/mateo-retegui/241850) | `shootPower` 82; `dribbling` 75 (leaf); `agility` 71 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Christopher Bonsu Baah | FW → LM | 274913 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/christopher-bonsu-baah/274913) | `shootPower` 74; `dribbling` 79 (leaf); `agility` 90 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

Ten EA primary positions fit the ledger's broad GK, DF, MF, or FW category. Two cross-category discrepancies are documented without modifying the roster: Nahitan Nández is ledger DF / EA CM, and Christopher Bonsu Baah is ledger FW / EA LM. The official Al Qadsiah team list and linked player pages support these identities and club affiliations.

This batch has **42 of 72** direct same-name canonical-field observations and **30** unresolved canonical-field slots. No player has all six position inputs directly observed under this conservative matching rule. OVR and EA category summaries were not copied into game data. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_afc_3` ledger rows and twelve distinct `fc27_source_player_id` values; source IDs and player identities are corroborated by official EA individual pages and the Al Qadsiah FC 27 team ratings list.
- Position accounting: 10 broad-position matches and 2 cross-category discrepancies.
- Field accounting: 42 direct leaves plus 30 unresolved slots equals 72.
- Ledger SHA-256 before and after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster, ledger, game, tier, backlog, or shared index data changed.
