# Rating-tier source batch audit: Al Ahli Saudi (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the 12 `cont_afc_0` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using the row's stable `fc27_source_player_id`. The official EA FC 27 [Al Ahli team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/al-ahli/112387) and linked individual player pages were used to confirm identities, positions, and club affiliation. No roster, ledger, game, tier, or verification values were changed.

## Source and method

Canonical position fields are from `data/mechanics/gameplay.json` (`positionOverallStats`). A value is recorded only when EA exposes an individual attribute leaf whose displayed label directly matches a canonical field. EA category summaries (including Pace, Passing, Dribbling, Defending, Physicality) are not individual field evidence. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the preceding group heading. `Finishing` is not `shootAccuracy`; `Heading Accuracy` is not `heading`; and `GK Reflexes` is not `gkSkill`. Therefore some available EA sub-attributes remain unresolved under this conservative same-name rule. No EA-to-game conversion or rating formula is inferred. The EA pages describe launch FC 27 Gold, Silver and Bronze Ultimate Team items; they exclude other item types and later live-form updates. Sources checked on 2026-11-02.

## Identity and directly observed canonical fields

`Game → EA` lists the ledger's broad primary position and EA's specific primary position. “Unresolved” means no qualifying direct same-name leaf was observed for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official EA page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Édouard Mendy | GK → GK | 234642 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/edouard-mendy/234642) | `gkDiving` 83; `agility` 50; `strength` 72; `stamina` 36 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Abdulrahman Al Sanbi | GK → GK | 263867 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/abdulrahman-al-sanbi/263867) | `gkDiving` 60; `agility` 45; `strength` 44; `stamina` 28 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Ibañez | DF → CB | 247257 — [EA player page](https://careers.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/ibanez/247257) | `strength` 86; `aggression` 86; `stamina` 85 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Merih Demiral | DF → CB | 238160 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/merih-demiral/238160) | `strength` 87; `aggression` 85; `stamina` 72 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Ali Majrashi | DF → RB | 242506 — [EA player page](https://www.ea.com/es/games/ea-sports-fc/ratings/player-ratings/ali-majrashi/242506) | `strength` 73; `aggression` 82; `stamina` 82 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Artem Bondarenko | MF → CAM | 255074 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/artem-bondarenko/255074) | `crossing` 71; `dribbling` 79 (leaf); `agility` 70; `stamina` 70 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Valentin Atangana | MF → CDM | 275137 — [EA player page](https://www.ea.com/fr/games/ea-sports-fc/ratings/player-ratings/valentin-atangana/275137) | `crossing` 52; `dribbling` 73 (leaf); `agility` 83; `stamina` 80 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Eduard Spertsyan | MF → CAM | 87127 — [EA player page](https://careers.ea.com/de/games/ea-sports-fc/ratings/player-ratings/eduard-spertsyan/87127) | `crossing` 75; `dribbling` 75 (leaf); `agility` 70; `stamina` 69 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Feras Al Brikan | MF → ST | 238545 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/feras-al-brikan/238545) | `crossing` 61; `dribbling` 69 (leaf); `agility` 72; `stamina` 87 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Ivan Toney | FW → ST | 212228 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/ivan-toney/212228) | `shootPower` 85; `dribbling` 75 (leaf); `agility` 70 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Trincão | FW → CAM | 244778 — [EA player page](https://careers.ea.com/games/ea-sports-fc/ratings/player-ratings/trincao/244778) | `shootPower` 81; `dribbling` 86 (leaf); `agility` 84 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Galeno | FW → LM | 239482 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/galeno/239482) | `shootPower` 82; `dribbling` 84 (leaf); `agility` 90 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

Nine EA primary positions fit the ledger's broad GK, DF, MF, or FW category. Three cross-category position discrepancies are recorded without modifying the roster: Feras Al Brikan is ledger MF / EA ST; Trincão is ledger FW / EA CAM; and Galeno is ledger FW / EA LM. The Al Ahli EA team list and individual pages confirm all twelve source IDs and club affiliations.

This batch has **42 of 72** direct same-name canonical-field observations and **30** unresolved canonical-field slots. No player has all six position inputs directly observed under the conservative match rule. OVR and EA category summaries were not copied into game data. No tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_afc_0` ledger rows and twelve distinct `fc27_source_player_id` values; the official EA Al Ahli team list and individual pages validate the source identities.
- Position accounting: 9 broad-position matches and 3 cross-category discrepancies.
- Field accounting: 42 direct leaves plus 30 unresolved slots equals 72.
- Ledger SHA-256 before and after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster, ledger, game, tier, backlog, or shared index data changed.
