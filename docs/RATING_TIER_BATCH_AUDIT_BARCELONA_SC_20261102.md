# Rating-tier source batch audit: Barcelona SC (12 players)

**Audit date:** 2026-11-02
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_31` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. EA's official [Barcelona SC FC 27 team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/barcelona-sc/110981) and the twelve linked official FC 27 individual profiles were checked for identity, source ID, primary position, club affiliation, and directly labelled canonical leaves. All twelve IDs resolve to same-name entries on the official team list; no conflicting identity or team affiliation was observed. Four EA primary-position discrepancies with the ledger are retained below. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the observed value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA states its FC 27 rating pages reflect launch Gold, Silver, and Bronze Ultimate Team items, not other item types or later live-form updates; club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are retained as source observations; they do not invalidate leaves when identity and club match.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| José Contreras | GK → GK | 231596 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jose-contreras/231596) | `gkDiving` 71; `agility` 45; `strength` 70; `stamina` 35 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Kleber Pinargote | GK → GK | 261407 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kleber-pinargote/261407) | `gkDiving` 63; `agility` 29; `strength` 38; `stamina` 27 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Javier Báez | DF → CB | 253245 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/javier-baez/253245) | `strength` 74; `aggression` 68; `stamina` 68 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Bryan Carabalí | DF → RB | 254238 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bryan-carabali/254238) | `strength` 66; `aggression` 59; `stamina` 75 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Alex Rangel | DF → CB | 71243 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alex-rangel/71243) | `strength` 74; `aggression` 63; `stamina` 70 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Gustavo Vallecilla | MF → CB **(discrepancy)** | 254172 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gustavo-vallecilla/254172) | `crossing` 56; `dribbling` 63 (leaf); `agility` 64; `stamina` 71 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Jhonny Quiñónez | MF → CDM | 253223 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jhonny-quinonez/253223) | `crossing` 56; `dribbling` 67 (leaf); `agility` 74; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Matías Lugo | MF → CM | 84326 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matias-lugo/84326) | `crossing` 62; `dribbling` 61 (leaf); `agility` 68; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Luis Cano | MF → LW **(discrepancy)** | 259905 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luis-cano/259905) | `crossing` 58; `dribbling` 69 (leaf); `agility` 74; `stamina` 68 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Darío Benedetto | FW → ST | 215061 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dario-benedetto/215061) | `shootPower` 79; `dribbling` 72 (leaf); `agility` 68 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Héctor Villalba | FW → RM **(discrepancy)** | 215107 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hector-villalba/215107) | `shootPower` 80; `dribbling` 66 (leaf); `agility` 78 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Jonathan Perlaza | FW → LM **(discrepancy)** | 255265 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jonathan-perlaza/255265) | `shootPower` 66; `dribbling` 72 (leaf); `agility` 62 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

There are **8 broad-position matches and 4 discrepancies**. Gustavo Vallecilla is ledger MF vs EA CB; Luis Cano is ledger MF vs EA LW; Héctor Villalba is ledger FW vs EA RM; Jonathan Perlaza is ledger FW vs EA LM. The official team and individual pages identify the same named players and Barcelona SC affiliation; these position observations are retained and flagged, not reassigned. No identity or team conflicts were observed.

The individual pages expose **42 of 72** directly matching same-name canonical-field observations, leaving **30 unresolved**. By ledger position group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating, or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_31` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; all twelve names and linked IDs appear on the official Barcelona SC team list.
- Position accounting: 8 broad-position matches and 4 discrepancies (Gustavo Vallecilla MF→CB; Luis Cano MF→LW; Héctor Villalba FW→RM; Jonathan Perlaza FW→LM).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index, and backlog were not edited.
