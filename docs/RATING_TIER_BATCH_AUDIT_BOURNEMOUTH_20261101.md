# Rating-tier source batch audit: AFC Bournemouth (12 players)

**Audit date:** 2026-11-01  
**Scope:** read-only check of the existing `club26_10` records in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The 12 source IDs are distinct and do not repeat IDs in the nine previous club reports. This batch has source IDs but blank `fc27_official_checked_date` values in the ledger; the official checks are documented here only. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

The primary source is [EA SPORTS FC 27 AFC Bournemouth Player Ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/afc-bournemouth/1943), with each source ID checked on its linked EA individual player page below. The official team listing and individual pages confirm names, AFC Bournemouth affiliation, source IDs, primary positions, and detailed attributes.

The game's canonical position-specific fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a matching named leaf attribute counts as direct evidence. Group summaries such as Passing, Pace, and Defending, composites, and approximate synonyms remain unresolved. Dribbling uses the leaf value within the Dribbling group. This does not approve EA-to-game scale or formula mapping.

EA's ratings pages describe launch Gold, Silver, and Bronze Ultimate Team items; they exclude other item types and subsequent live-form updates in other modes. This audit records only the EA fields they display.

## Identity and directly observed leaf fields

`Game → EA` lists the ledger's broad primary position followed by EA's page primary position. `—` indicates no direct same-name leaf for that canonical field. Values below are observations only; none was copied into game data.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Đorđe Petrović | GK → GK | 269626 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/or-e-petrovic/269626) | `gkDiving` 80; `agility` 45; `strength` 73; `stamina` 37 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Fraser Forster | GK → GK | 172203 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/fraser-forster/172203) | `gkDiving` 70; `agility` 39; `strength` 80; `stamina` 29 | `gkSkill`; `passing` (category summary only) |
| Adrien Truffert | DF → LB | 256769 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/adrien-truffert/256769) | `strength` 65; `aggression` 67; `stamina` 92 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Bafodé Diakité | DF → CB | 246565 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bafode-diakite/246565) | `strength` 78; `aggression` 81; `stamina` 73 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| James Hill | DF → CB | 248492 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/james-hill/248492) | `strength` 77; `aggression` 77; `stamina` 68 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Alex Scott | MF → CM | 261299 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alex-scott/261299) | `crossing` 76; `dribbling` 81; `agility` 84; `stamina` 89 | `passing` (category summary); `speedRating` (Pace summary) |
| Marcus Tavernier | MF → LM | 237477 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/marcus-tavernier/237477) | `crossing` 81; `dribbling` 80; `agility` 78; `stamina` 84 | `passing` (category summary); `speedRating` (Pace summary) |
| Rayan | MF → RM | 83494 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rayan/83494) | `crossing` 75; `dribbling` 83; `agility` 72; `stamina` 73 | `passing` (category summary); `speedRating` (Pace summary) |
| Tyler Adams | MF → CDM | 232999 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/tyler-adams/232999) | `crossing` 69; `dribbling` 74; `agility` 77; `stamina` 79 | `passing` (category summary); `speedRating` (Pace summary) |
| Eli Junior Kroupi | FW → ST | 277909 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/eli-junior-kroupi/277909) | `shootPower` 84 (EA Shot Power); `dribbling` 82; `agility` 80 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Evanilson | FW → ST | 256612 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/evanilson/256612) | `shootPower` 81 (EA Shot Power); `dribbling` 77; `agility` 69 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Justin Kluivert | FW → CAM | 236920 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/justin-kluivert/236920) | `shootPower` 84 (EA Shot Power); `dribbling` 81; `agility` 87 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

One source primary position falls outside the broad ledger role: Justin Kluivert is ledger FW → EA CAM. The other 11 are within their broad role (GK; LB/CB; CM/LM/RM/CDM; ST). Exact source positions are transcribed above and did not change the roster.

## Result and gate

There are **42 of 72** same-name leaf-field observations for the position-specific six-field slots. The other **30 slots** lack a direct leaf equivalent under this method: goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy`, and `heading`; canonical `passing` appears only as an EA group summary. No complete six-stat row is verified for any player in this batch.

No EA value was copied into the roster or source ledger. All 12 players remain unverified for canonical game stats; no OVR, tier, rarity, eligibility, or assignment was calculated or changed. Source-to-game field mapping and position reconciliation remain open.

## Focused audit validation

- Batch membership: exactly 12 `club26_10` ledger records, 12 distinct source IDs, and no ID repeated in the nine previous club reports.
- Source cross-check: the official AFC Bournemouth team listing and all 12 linked EA pages confirm names, IDs, club affiliation, and primary positions.
- Field accounting: 42 direct same-name leaf observations plus 30 unresolved position-field slots = 72.
- Safety: documentation-only audit; roster and ledger values, verification flags, and tier assignments remain unchanged.
