# Rating-tier source batch audit: Real Madrid (12 players)

**Audit date:** 2026-11-01  
**Scope:** read-only check of the existing `club26_7` records in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The 12 source IDs are distinct within the batch and do not repeat IDs in the seven previous club reports. This batch's ledger rows have FC27 source IDs but no `fc27_official_checked_date`; the checks documented here were newly performed against EA's official pages. No player, rating, tier, identity, or source-ledger field was changed.

## Source and method

The source set is [EA SPORTS FC 27 Real Madrid Player Ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/real-madrid/243) and the 12 linked individual EA player pages below. The team listing confirms each player's Real Madrid affiliation and the individual pages provide their official source ID, primary position, and detailed attributes.

The game's canonical position-specific fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a matching named leaf attribute counts as direct field evidence. Group summaries such as Passing, Pace, and Defending, composites, and approximate synonyms remain unresolved. Detailed Dribbling uses the leaf value within the Dribbling group. This audit does not approve mappings between EA's ratings scale and the game's scale.

EA's rating pages describe launch Gold, Silver, and Bronze Ultimate Team items; they exclude other item types and later live-form updates in other modes. These pages evidence only the EA fields they display.

## Identity and directly observed leaf fields

`Game → EA` gives the ledger's broad primary position and EA's page primary position. `—` means no direct same-name leaf for that canonical field under this method. Values listed are observations from the linked EA page, not values copied to game data.

| Ledger player | Game → EA position | EA source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields still unresolved |
|---|---|---|---|---|
| Thibaut Courtois | GK → GK | 192119 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/thibaut-courtois/192119) | `gkDiving` 87; `agility` 63; `strength` 70; `stamina` 38 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Andriy Lunin | GK → GK | 243952 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/andriy-lunin/243952) | `gkDiving` 80; `agility` 36; `strength` 61; `stamina` 32 | `gkSkill`; `passing` (category summary only) |
| Federico Valverde | DF → CM | 239053 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/federico-valverde/239053) | `strength` 82; `aggression` 82; `stamina` 94 | `defence` (EA Defending is a category summary); `speedRating` (Pace summary); `heading` (EA leaf is Heading Accuracy) |
| Cucurella | DF → LB | 239231 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/cucurella/239231) | `strength` 69; `aggression` 85; `stamina` 89 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Éder Militão | DF → CB | 240130 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/eder-militao/240130) | `strength` 79; `aggression` 83; `stamina` 84 | `defence` (category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Aurélien Tchouaméni | MF → CDM | 241637 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/aurelien-tchouameni/241637) | `crossing` 68; `dribbling` 75; `agility` 71; `stamina` 83 | `passing` (category summary); `speedRating` (Pace summary) |
| Bernardo Silva | MF → CM | 218667 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bernardo-silva/218667) | `crossing` 82; `dribbling` 85; `agility` 92; `stamina` 87 | `passing` (category summary); `speedRating` (Pace summary) |
| Rodrygo | MF → LW | 243812 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rodrygo/243812) | `crossing` 78; `dribbling` 88; `agility` 86; `stamina` 76 | `passing` (category summary); `speedRating` (Pace summary) |
| Trent Alexander-Arnold | MF → RB | 231281 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/trent-alexander-arnold/231281) | `crossing` 93; `dribbling` 78; `agility` 73; `stamina` 83 | `passing` (category summary); `speedRating` (Pace summary) |
| Kylian Mbappé | FW → ST | 231747 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kylian-mbappe/231747) | `shootPower` 91 (EA Shot Power); `dribbling` 92; `agility` 93 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Jude Bellingham | FW → CAM | 252371 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jude-bellingham/252371) | `shootPower` 86 (EA Shot Power); `dribbling` 88; `agility` 83 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Vini Jr. | FW → LW | 238794 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/vini-jr/238794) | `shootPower` 81 (EA Shot Power); `dribbling` 93; `agility` 94 | `shootAccuracy`; `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies

Four EA primary positions fall outside the broad role indicated by the ledger: Valverde is ledger DF → EA CM; Rodrygo and Trent Alexander-Arnold are ledger MF → EA LW and RB; and Bellingham is ledger FW → EA CAM. The other eight remain within the same broad role (GK; LB/CB; CDM/CM; ST/LW). Exact EA positions are transcribed above; no source position was used to alter the game's roster.

## Result and gate

There are **42 of 72** same-name leaf-field observations for the position-specific six-field slots. The remaining **30 slots** have no direct leaf equivalent under this method: goalkeeper `gkSkill`, defensive `defence`, `speedRating`, forward `shootAccuracy`, and `heading`; canonical `passing` is represented only by EA's grouped Passing summary. No complete six-stat row is verified for any player in this batch.

No EA value was copied into the roster or source ledger. All records remain unverified for canonical game stats; no OVR, tier, rarity, eligibility, or assignment was calculated or changed. Source-to-game field mapping and position reconciliation remain open.

## Focused audit validation

- Batch membership: 12 `club26_7` records, 12 distinct source IDs, and no IDs duplicated in the seven prior audit reports.
- Source cross-check: the official Real Madrid listing and linked EA individual pages confirm the listed source IDs, names, team affiliation, and primary positions.
- Field accounting: 42 direct same-name leaf observations plus 30 unresolved position-field slots = 72.
- Safety: documentation-only audit; source ledger and roster values, verification flags, and tier assignments were not changed.
