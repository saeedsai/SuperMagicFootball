# Rating-tier source batch audit: Aston Villa (12 players)

**Audit date:** 2026-11-01  
**Scope:** read-only check of the existing `club26_6` records in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). These 12 source IDs are distinct and do not repeat IDs in the eight previously audited batches. This batch has source IDs but blank `fc27_official_checked_date` values in the ledger; official checks are documented here only. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

The primary source is [EA SPORTS FC 27 Aston Villa Player Ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/aston-villa/2), with each source ID checked against its linked EA individual player page below. The pages establish the displayed player name, Aston Villa affiliation, source position, and detailed attributes.

The game's canonical position-specific fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a matching named leaf attribute counts as direct evidence. Group summaries such as Passing, Pace, and Defending, composites, and approximate synonyms remain unresolved. Dribbling uses the leaf value within the Dribbling group. This does not establish that EA values map to SuperMagicFootball's scale or formula.

EA's ratings pages cover launch Gold, Silver, and Bronze Ultimate Team player items, excluding other item types and subsequent live-form updates in other modes. The evidence is limited to the fields EA publishes there.

## Identity and directly observed leaf fields

`Game → EA` lists the ledger's broad primary position followed by the EA page's primary position. `—` means no direct same-name leaf value for that canonical field under this method. Values below are observations only and were not copied into game data.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Emiliano Martínez | GK → GK | 202811 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/emiliano-martinez/202811) | `gkDiving` 83; `agility` 54; `strength` 78; `stamina` 40 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Marco Bizot | GK → GK | 200110 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marco-bizot/200110) | `gkDiving` 77; `agility` 50; `strength` 63; `stamina` 31 | `gkSkill`; `passing` (category summary only) |
| Matty Cash | DF → RB | 227174 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matty-cash/227174) | `strength` 68; `aggression` 84; `stamina` 86 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Pau Torres | DF → CB | 241464 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pau-torres/241464) | `strength` 74; `aggression` 73; `stamina` 71 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Ian Maatsen | DF → LB | 248465 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ian-maatsen/248465) | `strength` 52; `aggression` 73; `stamina` 74 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Boubacar Kamara | MF → CDM | 236987 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/boubacar-kamara/236987) | `crossing` 67; `dribbling` 78; `agility` 66; `stamina` 78 | `passing` (category summary); `speedRating` (Pace summary) |
| Amadou Onana | MF → CDM | 257057 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/amadou-onana/257057) | `crossing` 64; `dribbling` 79; `agility` 49; `stamina` 76 | `passing` (category summary); `speedRating` (Pace summary) |
| Johan Manzambi | MF → CM | 276694 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/johan-manzambi/276694) | `crossing` 58; `dribbling` 85; `agility` 84; `stamina` 77 | `passing` (category summary); `speedRating` (Pace summary) |
| João Gomes | MF → CDM | 273463 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joao-gomes/273463) | `crossing` 64; `dribbling` 73; `agility` 74; `stamina` 83 | `passing` (category summary); `speedRating` (Pace summary) |
| Ollie Watkins | FW → ST | 221697 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ollie-watkins/221697) | `shootPower` 83 (EA Shot Power); `dribbling` 78; `agility` 78 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| John McGinn | FW → RM | 210881 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/john-mc-ginn/210881) | `shootPower` 84 (EA Shot Power); `dribbling` 81; `agility` 77 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Emiliano Buendía | FW → LM | 226162 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/emiliano-buendia/226162) | `shootPower` 79 (EA Shot Power); `dribbling` 84; `agility` 85 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Two source primary positions fall outside the broad ledger role: John McGinn and Emiliano Buendía are ledger FW but EA RM and LM. The remaining ten are within their broad ledger roles (GK; RB/CB/LB; CDM/CM; ST). Exact EA positions are transcribed above; none was used to alter the roster.

## Result and gate

There are **42 of 72** same-name leaf-field observations for the position-specific six-field slots. The remaining **30 slots** lack a direct leaf equivalent under this method: goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy`, and `heading`; canonical `passing` appears only as EA's grouped Passing summary. No complete six-stat row is verified for any player in this batch.

No EA value was copied into the roster or source ledger. The records remain unverified for canonical game stats; no OVR, tier, rarity, eligibility, or assignment was calculated or changed. Source-to-game field mapping and position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 `club26_6` ledger records, 12 distinct source IDs, with no ID repeated in the eight previous audit reports.
- Source cross-check: the official team listing and its 12 linked EA individual pages confirm player IDs, names, Aston Villa affiliation, and primary positions.
- Field accounting: 42 direct same-name leaf observations plus 30 unresolved position-field slots = 72.
- Safety: documentation-only audit; the source ledger, roster, verification flags, and tier assignments were not changed.
