# Rating-tier source batch audit: CF Cruz Azul (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_concacaf_16` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). I checked each stable FC 27 source ID against its official EA SPORTS individual ratings page and the official [CF Cruz Azul team ratings list](https://www.ea.com/es/games/ea-sports-fc/ratings/teams-ratings/cf-cruz-azul/1878). All twelve same-name player entries are on the EA team list and the individual pages identify these players as CF Cruz Azul. No roster or source-ledger data, canonical inputs, identities, tiers, or verification flags were changed.

## Source and method

Canonical field slots are from `data/mechanics/gameplay.json` → `positionOverallStats`. Only a directly matching individual EA attribute leaf counts. EA category summaries such as `Passing`, `Pace`, `Defending`, `Dribbling`, and `Physicality` do not count as leaves; the separately repeated `Dribbling` leaf does. EA `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not `heading`; `GK Reflexes` is not `gkSkill`.

`Game → EA` gives the ledger's broad primary role followed by EA's specific primary position. EA's FC 27 ratings page describes launch Gold, Silver, and Bronze Ultimate Team player items; it excludes other item types and live-form updates in other modes. Club affiliations may change. These are source observations only and do not infer any EA-to-game scale, formula, rating, tier, or eligibility. “—” means no directly matching EA leaf was observed for that canonical field.

## Identity and directly observed leaf fields

| Ledger player | Game → EA position | FC 27 source ID and official EA page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Kevin Mier | GK → GK | 261417 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kevin-mier/261417) | `gkDiving` 75; `agility` 46; `strength` 44; `stamina` 35 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Andrés Gudiño | GK → GK | 252801 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/andres-gudino/252801) | `gkDiving` 68; `agility` 48; `strength` 61; `stamina` 18 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Willer Ditta | DF → CB | 245810 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/willer-ditta/245810) | `strength` 86; `aggression` 82; `stamina` 80 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Erik Lira | DF → CDM **(discrepancy)** | 257784 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/erik-lira/257784) | `strength` 68; `aggression` 80; `stamina` 90 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Gonzalo Piovi | DF → CB | 219670 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gonzalo-piovi/219670) | `strength` 75; `aggression` 79; `stamina` 73 | `defence` (EA Defending is a group summary); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Carlos Rodríguez | MF → CM | 235389 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/carlos-rodriguez/235389) | `crossing` 63; `dribbling` 75 (leaf); `agility` 86; `stamina` 88 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Agustín Palavecino | MF → CM | 247450 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/agustin-palavecino/247450) | `crossing` 76; `dribbling` 77 (leaf); `agility` 80; `stamina` 63 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Jeremy Márquez | MF → CM | 255111 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jeremy-marquez/255111) | `crossing` 60; `dribbling` 74 (leaf); `agility` 74; `stamina` 84 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| Luka Romero | MF → RM | 258467 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/luka-romero/258467) | `crossing` 68; `dribbling` 75 (leaf); `agility` 90; `stamina` 74 | `passing` (EA Passing is a group summary); `speedRating` (EA Pace summary) |
| José Paradela | FW → CAM **(discrepancy)** | 245354 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jose-paradela/245354) | `shootPower` 74; `dribbling` 76 (leaf); `agility` 79 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Rodolfo Rotondi | FW → LM **(discrepancy)** | 242571 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rodolfo-rotondi/242571) | `shootPower` 66; `dribbling` 76 (leaf); `agility` 86 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |
| Gabriel Fernández | FW → ST | 251611 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gabriel-fernandez/251611) | `shootPower` 74; `dribbling` 61 (leaf); `agility` 66 | `shootAccuracy` (EA label is Finishing); `speedRating` (EA Pace summary); `heading` (EA label is Heading Accuracy) |

## Position discrepancies and result

Nine EA primary positions fit the ledger's broad GK/DF/MF/FW role. Three are cross-category discrepancies: Erik Lira is stored as `DF` but EA lists `CDM`; José Paradela is stored as `FW` but EA lists `CAM`; Rodolfo Rotondi is stored as `FW` but EA lists `LM`. These mismatches are recorded without converting or changing game positions.

This batch has **42 of 72** direct same-name leaf observations and **30** unresolved canonical slots. No player has all six position-specific inputs directly observed under the conservative matching rule. EA group summaries and related but non-identical leaves remain unresolved; no rating, tier, eligibility, or assignment was inferred or changed.

## Focused audit validation

- Membership: exactly twelve `cont_concacaf_16` ledger rows and twelve distinct stable source IDs; all twelve IDs resolve to same-name EA player pages and all twelve names appear in EA's CF Cruz Azul team list.
- Identity conflicts: none observed in the stable-ID, player-name, and Club affiliation checks.
- Position accounting: 9 broad-role matches and 3 discrepancies (Erik Lira, José Paradela, Rodolfo Rotondi).
- Field accounting: 42 direct observations + 30 unresolved slots = 72.
- Source-ledger SHA-256 before and after this audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: only this new report was created; roster/game data, shared backlog, and shared indexes were not edited.
