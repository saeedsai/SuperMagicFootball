# Rating-tier source batch audit: Always Ready (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_conmebol_20` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), keyed by their explicit FC 27 source-player IDs. EA's official [Always Ready FC 27 team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/always-ready/114577) and the twelve official individual FC 27 player pages were checked for identity, source ID, primary position, club affiliation, and directly labelled canonical leaves. All twelve IDs resolve to same-name entries on the official team list. Eleven individual profiles identify Always Ready; no conflicting identity or team affiliation was observed. Jesús Maraude's ledger FW position differs from EA's LM position. No player, roster, ledger, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending, and Physicality) are not individual fields. For Dribbling, the observed value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA states its FC 27 rating pages reflect launch Gold, Silver, and Bronze Ultimate Team items, not other item types or later live-form updates; club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. Broad position matching uses GK→GK, DF→CB/LB/RB, MF→CAM/CDM/CM/LM/RM, and FW→ST/LW/RW. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field. Position discrepancies are retained as source observations; they do not invalidate leaves when identity and club match.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Alain Baroja | GK → GK | 217095 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alain-baroja/217095) | `gkDiving` 71; `agility` 32; `strength` 66; `stamina` 44 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Enzo Rodríguez | GK → GK | 71535 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/enzo-rodriguez/71535) | `gkDiving` 58; `agility` 34; `strength` 70; `stamina` 31 | `gkSkill` (EA label GK Reflexes); `passing` (EA Passing is a group summary) |
| Richet Gómez | DF → CB | 253612 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/richet-gomez/253612) | `strength` 68; `aggression` 66; `stamina` 80 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Alex Rambal | DF → CB | 218731 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alex-rambal/218731) | `strength` 72; `aggression` 64; `stamina` 57 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Carlitos Rodriguez | DF → RB | 270581 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/carlitos-rodriguez/270581) | `strength` 33; `aggression` 56; `stamina` 72 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Fernando Saucedo | MF → CM | 233569 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/fernando-saucedo/233569) | `crossing` 56; `dribbling` 64 (leaf); `agility` 58; `stamina` 76 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Rai Pablo Lima | MF → CDM | 267457 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rai-pablo-lima/267457) | `crossing` 58; `dribbling` 66 (leaf); `agility` 64; `stamina` 75 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Joel Amoroso | MF → RM | 226659 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joel-amoroso/226659) | `crossing` 61; `dribbling` 66 (leaf); `agility` 72; `stamina` 65 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Darío Torrico | MF → CAM | 71341 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/dario-torrico/71341) | `crossing` 61; `dribbling` 68 (leaf); `agility` 74; `stamina` 53 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Enrique Triverio | FW → ST | 217201 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/enrique-triverio/217201) | `shootPower` 75; `dribbling` 67 (leaf); `agility` 64 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Juan Godoy | FW → ST | 264708 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/juan-godoy/264708) | `shootPower` 65; `dribbling` 65 (leaf); `agility` 70 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |
| Jesús Maraude | FW → LM **(discrepancy)** | 83498 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jesus-maraude/83498) | `shootPower` 59; `dribbling` 72 (leaf); `agility` 73 | `shootAccuracy` (EA label Finishing); `speedRating` (Pace summary); `heading` (EA label Heading Accuracy) |

## Position check and result

There are **11 broad-position matches and 1 discrepancy**. Jesús Maraude is ledger FW while EA lists LM. The official EA team list and individual profile identify the same player and Always Ready affiliation; the source observation is retained with the mismatch flagged, not reassigned. No identity or team conflicts were observed.

The individual pages expose **42 of 72** directly matching same-name canonical-field observations, leaving **30 unresolved**. By ledger position group, direct/unresolved counts are GK 8/4, DF 9/9, MF 16/8, and FW 9/9. No player has all six position inputs directly observed under this conservative matching rule. No EA group summary, headline rating, or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_conmebol_20` ledger rows, twelve distinct canonical player IDs, and twelve distinct explicit FC 27 source IDs; each appears on the official Always Ready team list with a matching-name linked profile.
- Position accounting: 11 broad-position matches and 1 discrepancy (Jesús Maraude: FW → LM).
- Identity/team conflicts: none observed; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 directly observed leaves + 30 unresolved canonical fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: this dated audit report only; source ledger, roster/game data, shared index, and backlog were not edited.
