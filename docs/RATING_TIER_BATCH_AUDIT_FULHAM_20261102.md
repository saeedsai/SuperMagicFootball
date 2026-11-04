# Rating-tier source batch audit: Fulham (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_23` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The twelve stable FC 27 source IDs were checked against official EA SPORTS individual player pages. No roster or source-ledger data, ratings, tiers, identities, or verification fields were changed.

## Source and method

The primary sources are the official [EA SPORTS FC 27 Fulham ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/fulham/144) and the individual ratings pages in the table. Canonical game fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only a same-named, individually displayed EA leaf attribute counts as direct evidence. Group summaries such as Passing, Pace, Dribbling, Defending, and Physicality do not count as a leaf. For Dribbling, this audit records the named Dribbling attribute leaf rather than the group heading. EA `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`.

EA ratings pages cover Gold, Silver, and Bronze Ultimate Team player items available at launch; other item types and later live-form updates in other modes are excluded. Club affiliations can change. Values here are observations only and do not establish a game scale, formula, or tier mapping.

## Identity and directly observed leaf fields

`Game → EA` gives the ledger’s broad primary position followed by EA’s specific primary position. `—` means no directly named EA leaf for that canonical input.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields unresolved |
|---|---|---|---|---|
| Bernd Leno | GK → GK | 192563 — [EA player page, OVR 79](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/bernd-leno/192563) | `gkDiving` 78; `agility` 51; `strength` 70; `stamina` 44 | `gkSkill`; `passing` (EA Passing is a group summary) |
| Benjamin Lecomte | GK → GK | 200726 — [EA player page, OVR 73](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/benjamin-lecomte/200726) | `gkDiving` 71; `agility` 36; `strength` 68; `stamina` 31 | `gkSkill`; `passing` (group summary) |
| Antonee Robinson | DF → LB | 229348 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/antonee-robinson/229348) | `strength` 68; `aggression` 83; `stamina` 85 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Joachim Andersen | DF → CB | 224221 — [EA player page, OVR 79](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/joachim-andersen/224221) | `strength` 87; `aggression` 86; `stamina` 74 | `defence` (group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Calvin Bassey | DF → CB | 241436 — [EA player page, OVR 78](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/calvin-bassey/241436) | `strength` 88; `aggression` 85; `stamina` 78 | `defence` (group summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Sander Berge | MF → CDM | 228092 — [EA player page, OVR 79](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sander-berge/228092) | `crossing` 66; `dribbling` 75 (leaf); `agility` 39; `stamina` 81 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Kenny Tete | MF → RB | 216266 — [EA player page, OVR 78](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kenny-tete/216266) | `crossing` 76; `dribbling` 71 (leaf); `agility` 75; `stamina` 74 | `passing` (group summary); `speedRating` (Pace summary) |
| Ryan Sessegnon | MF → LB | 235883 — [EA player page, OVR 77](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ryan-sessegnon/235883) | `crossing` 78; `dribbling` 78 (leaf); `agility` 79; `stamina` 70 | `passing` (group summary); `speedRating` (Pace summary) |
| Kevin | MF → LM | 70571 — [EA player page, OVR 76](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kevin/70571) | `crossing` 74; `dribbling` 85 (leaf); `agility` 81; `stamina` 67 | `passing` (group summary); `speedRating` (Pace summary) |
| Alex Iwobi | FW → LM | 213655 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alex-iwobi/213655) | `shootPower` 79; `dribbling` 84 (leaf); `agility` 75 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Emile Smith Rowe | FW → CAM | 240273 — [EA player page, OVR 77](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/emile-smith-rowe/240273) | `shootPower` 74; `dribbling` 82 (leaf); `agility` 78 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Rodrigo Muniz | FW → ST | 264337 — [EA player page, OVR 76](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/rodrigo-muniz/264337) | `shootPower` 80; `dribbling` 72 (leaf); `agility` 70 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |

## Position discrepancies and result

Four EA primary positions fall outside the ledger’s broad role: Kenny Tete is stored MF but EA lists RB; Ryan Sessegnon is stored MF but EA lists LB; Alex Iwobi is stored FW but EA lists LM; and Emile Smith Rowe is stored FW but EA lists CAM. The other eight positions fit the ledger’s broad GK, DF, MF, or FW category. These are recorded as source discrepancies only; no roster positions were changed.

The batch has **42 of 72** direct same-name leaf observations, leaving **30** canonical input slots unresolved. No player has a fully observed six-field row under the conservative matching rule. OVR and attribute values are observations only. No OVR, tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `club26_23` ledger rows and twelve distinct FC 27 source IDs. Each linked official page shows the matching player name, source ID, current Fulham team, EA primary position, and OVR.
- Field accounting: 42 direct observations plus 30 unresolved position-field slots equals 72.
- Source-ledger safety: SHA-256 before and after this documentation-only audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
