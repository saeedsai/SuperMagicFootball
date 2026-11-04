# Rating-tier source batch audit: FC Porto (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of the existing `club26_26` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). The twelve stable FC 27 source IDs were matched to EA's official FC Porto list and individual player pages. No roster or source-ledger data, ratings, tiers, identities, or verification fields were changed.

## Source and method

The primary team source is EA SPORTS' [FC Porto player ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/fc-porto/236); each player link points to that person's individual official page. Canonical fields are defined by `data/mechanics/gameplay.json` (`positionOverallStats`). Only an identically named, individually displayed EA leaf counts as direct evidence. Category summaries such as Passing, Pace, Dribbling, and Defending do not count. This audit records the individual Dribbling leaf rather than the Dribbling group heading. EA Finishing is not mapped to `shootAccuracy`; Heading Accuracy is not mapped to `heading`.

EA describes these ratings as Gold, Silver, and Bronze Ultimate Team items available at launch. Other item types and later live-form changes in other modes are excluded; club affiliation can change. The values below are observations only and do not establish the game's scale, OVR formula, or tier mapping.

## Identity and directly observed leaf fields

`Game → EA` gives the ledger's broad primary position followed by EA's specific primary position. `—` means the canonical input has no directly named EA leaf under the conservative matching rule.

| Ledger player | Game → EA position | FC 27 source ID and official page | Canonical fields with direct same-name leaf evidence | Canonical fields unresolved |
|---|---|---|---|---|
| Diogo Costa | GK → GK | 234577 — [EA player page, OVR 86](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/diogo-costa/234577) | `gkDiving` 85; `agility` 42; `strength` 63; `stamina` 28 | `gkSkill`; `passing` (EA Passing is a category summary) |
| Jakub Kiwior | DF → CB | 265693 — [EA player page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jakub-kiwior/265693) | `strength` 80; `aggression` 78; `stamina` 74 | `defence` (Defending category summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Alberto Costa | DF → RB | 270674 — [EA player page, OVR 78](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alberto-costa/270674) | `strength` 74; `aggression` 66; `stamina` 88 | `defence` (Defending category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Pablo Rosario | MF → CDM | 235134 — [EA player page, OVR 78](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pablo-rosario/235134) | `crossing` 59; `dribbling` 75 (leaf); `agility` 70; `stamina` 84 | `passing` (category summary); `speedRating` (Pace summary) |
| Victor Froholdt | MF → CM | 279015 — [EA player page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/victor-froholdt/279015) | `crossing` 66; `dribbling` 82 (leaf); `agility` 78; `stamina` 93 | `passing` (category summary); `speedRating` (Pace summary) |
| Samu | FW → ST | 277581 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/samu/277581) | `shootPower` 83; `dribbling` 71 (leaf); `agility` 57 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Jan Bednarek | DF → CB | 220570 — [EA player page, OVR 82](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jan-bednarek/220570) | `strength` 85; `aggression` 83; `stamina` 79 | `defence` (Defending category summary); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Gabri Veiga | MF → CM | 258729 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/gabri-veiga/258729) | `crossing` 69; `dribbling` 81 (leaf); `agility` 74; `stamina` 72 | `passing` (category summary); `speedRating` (Pace summary) |
| Alan Varela | MF → CDM | 260599 — [EA player page, OVR 80](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alan-varela/260599) | `crossing` 66; `dribbling` 75 (leaf); `agility` 71; `stamina` 84 | `passing` (category summary); `speedRating` (Pace summary) |
| Pepê | FW → RW | 238896 — [EA player page, OVR 77](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/pepe/238896) | `shootPower` 68; `dribbling` 83 (leaf); `agility` 86 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| André Silva | FW → ST | 228941 — [EA player page, OVR 77](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/andre-silva/228941) | `shootPower` 77; `dribbling` 77 (leaf); `agility` 77 | `shootAccuracy` (EA Finishing is differently named); `speedRating` (Pace summary); `heading` (Heading Accuracy label) |
| Cláudio Ramos | GK → GK | 198513 — [EA player page, OVR 73](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/claudio-ramos/198513) | `gkDiving` 78; `agility` 62; `strength` 75; `stamina` 44 | `gkSkill`; `passing` (EA Passing is a category summary) |

## Position discrepancies and result

One EA primary position falls outside the ledger's broad role: Pepê is stored as FW while EA lists RW. The other eleven positions fit the ledger's broad GK, DF, MF, or FW category. This is recorded as a source discrepancy only; no game roster role was changed.

The batch has **42 of 72** direct same-name leaf observations, leaving **30** canonical input slots unresolved. No player has a fully observed six-field row under this matching rule. OVR and attribute values remain observations only; no OVR, tier, rarity, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `club26_26` ledger rows and twelve distinct FC 27 source IDs; every linked individual EA page identifies the matching player and source ID, current FC Porto team, primary position, and OVR.
- Field accounting: 42 direct observations plus 30 unresolved position-field slots equals 72.
- Source-ledger safety: SHA-256 before and after this documentation-only audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope safety: no roster data or source-ledger fields changed.
