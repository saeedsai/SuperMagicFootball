# Rating-tier source batch audit: Shakhtar Donetsk (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_uefa_29` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. The official [EA SPORTS FC 27 Shakhtar Donetsk ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/shakhtar-donetsk/101059) and all twelve official individual player pages were checked for matching names, identities, primary positions and Shakhtar Donetsk affiliation. All twelve stable IDs resolve to the ledger's same-name players and appear on EA's Shakhtar Donetsk team list. Four broad-position discrepancies are recorded below; no identity or club conflicts were observed. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items and exclude other item types and later live-form updates in other modes; EA notes club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are retained as source observations but do not invalidate directly observed leaves when the stable identity and team match.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Dmytro Riznyk | GK → GK | 265628 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dmytro-riznyk/265628) | `gkDiving` 75; `agility` 33; `strength` 61; `stamina` 30 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Kiril Fesiun | GK → GK | 72917 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kiril-fesiun/72917) | `gkDiving` 69; `agility` 30; `strength` 61; `stamina` 28 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Mykola Matviienko | DF → CB | 229528 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mykola-matviienko/229528) | `strength` 76; `aggression` 75; `stamina` 76 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Valeriy Bondar | DF → CB | 248698 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/valeriy-bondar/248698) | `strength` 75; `aggression` 69; `stamina` 76 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Oleksandr Karavaiev | DF → RB | 237109 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/oleksandr-karavaiev/237109) | `strength` 59; `aggression` 61; `stamina` 77 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Dmytro Kryskiv | MF → CM | 274732 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dmytro-kryskiv/274732) | `crossing` 55; `dribbling` 70 (leaf); `agility` 71; `stamina` 69 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Pedro Henrique | MF → LB **(discrepancy)** | 277193 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pedro-henrique/277193) | `crossing` 70; `dribbling` 74 (leaf); `agility` 79; `stamina` 77 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lassina Traoré | MF → ST **(discrepancy)** | 246728 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lassina-traore/246728) | `crossing` 47; `dribbling` 65 (leaf); `agility` 68; `stamina` 61 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Vinícius Tobías | MF → RB **(discrepancy)** | 268411 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/vinicius-tobias/268411) | `crossing` 69; `dribbling` 72 (leaf); `agility` 70; `stamina` 70 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Pedrinho | FW → RM **(discrepancy)** | 255472 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pedrinho/255472) | `shootPower` 71; `dribbling` 79 (leaf); `agility` 86 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Prosper Obah | FW → RW | 83057 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/prosper-obah/83057) | `shootPower` 65; `dribbling` 74 (leaf); `agility` 71 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Kauã Elias | FW → ST | 77760 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kaua-elias/77760) | `shootPower` 72; `dribbling` 80 (leaf); `agility` 65 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Pedro Henrique's EA primary position is LB while the ledger records MF; Lassina Traoré's EA primary position is ST while the ledger records MF; Vinícius Tobías's EA primary position is RB while the ledger records MF; and Pedrinho's EA primary position is RM while the ledger records FW. These four broad-position discrepancies are retained without changing roster assignments. The other eight EA primary positions fit their ledger broad categories. EA's official team list includes all twelve audited names, and each individual page's stable-ID route resolves to the same-name Shakhtar Donetsk player. No identity or club conflict was observed.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_29` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's team list includes all twelve and individual player URLs resolve to their same-name identities and Shakhtar Donetsk affiliation.
- Position accounting: 8 broad-position matches and 4 discrepancies (Pedro Henrique, Lassina Traoré, Vinícius Tobías, Pedrinho).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.

