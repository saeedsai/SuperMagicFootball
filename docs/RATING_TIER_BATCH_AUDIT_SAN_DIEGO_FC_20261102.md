# Rating-tier source batch audit: San Diego FC (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_concacaf_24` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. EA's official [FC 27 San Diego FC ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/san-diego-fc/131439) includes all twelve audited names and their IDs. Each official individual page resolves to the same-name San Diego FC player. No identity/team conflicts were observed. No player, roster, ledger, tier, or verification data were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling,” not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver, and Bronze Ultimate Team items, exclude other item types and live-form updates in other modes, and note that club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad-position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are recorded without changing roster assignments.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Duran Ferree | GK → GK | 279706 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/duran-ferree/279706) | `gkDiving` 63; `agility` 29; `strength` 46; `stamina` 20 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| CJ dos Santos | GK → GK | 267636 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/cj-dos-santos/267636) | `gkDiving` 61; `agility` 22; `strength` 68; `stamina` 25 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Jeppe Tverskov | DF → CDM **(discrepancy)** | 224067 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jeppe-tverskov/224067) | `strength` 88; `aggression` 66; `stamina` 86 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Aníbal Godoy | DF → CM **(discrepancy)** | 217047 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/anibal-godoy/217047) | `strength` 73; `aggression` 85; `stamina` 74 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Christopher McVey | DF → CB | 242199 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/christopher-mc-vey/242199) | `strength` 79; `aggression` 69; `stamina` 87 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Amahl Pellegrino | MF → LM | 224874 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/amahl-pellegrino/224874) | `crossing` 66; `dribbling` 69 (leaf); `agility` 84; `stamina` 76 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Lewis Morgan | MF → ST **(discrepancy)** | 221908 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lewis-morgan/221908) | `crossing` 73; `dribbling` 72 (leaf); `agility` 77; `stamina` 70 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Elias Achouri | MF → LM | 263672 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/elias-achouri/263672) | `crossing` 63; `dribbling` 73 (leaf); `agility` 72; `stamina` 70 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Luca Bombino | MF → LB **(discrepancy)** | 75236 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luca-bombino/75236) | `crossing` 62; `dribbling` 64 (leaf); `agility` 70; `stamina` 77 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Anders Dreyer | FW → RW | 236918 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/anders-dreyer/236918) | `shootPower` 84; `dribbling` 77 (leaf); `agility` 90 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Marcus Ingvartsen | FW → ST | 215247 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marcus-ingvartsen/215247) | `shootPower` 78; `dribbling` 73 (leaf); `agility` 64 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Onni Valakari | FW → CM **(discrepancy)** | 245685 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/onni-valakari/245685) | `shootPower` 65; `dribbling` 67 (leaf); `agility` 74 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

Jeppe Tverskov is stored as ledger `DF`, while EA lists `CDM`; Aníbal Godoy is stored as `DF`, while EA lists `CM`; Lewis Morgan is stored as `MF`, while EA lists `ST`; Luca Bombino is stored as `MF`, while EA lists `LB`; and Onni Valakari is stored as `FW`, while EA lists `CM`. These five EA primary positions fall outside the ledger's broad-position groups. The other seven fit their ledger groups. EA's San Diego FC team list includes every audited name and corresponding ID, and individual pages corroborate the same identity and team. No identity/team conflicts were observed; no conflicted field observations were excluded.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved fields. By group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_concacaf_24` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; EA's official San Diego FC list includes all twelve and individual pages corroborate same-name identity and club affiliation.
- Position accounting: 7 broad-position matches and 5 discrepancies (Jeppe Tverskov: DF/CDM; Aníbal Godoy: DF/CM; Lewis Morgan: MF/ST; Luca Bombino: MF/LB; Onni Valakari: FW/CM).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index and backlog were not edited.
