# Rating-tier source batch audit: PSV Eindhoven (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only audit of exactly the twelve `cont_uefa_24` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv), using each row's stable FC 27 source-player ID. EA's official [PSV FC 27 team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/psv/247) and all twelve individual pages were checked for names, identity, primary position, and PSV affiliation. All twelve individual pages identify the same-name player as a PSV player. No identity or team conflicts were found. No roster, ledger, game, tier, or verification values were changed.

## Source and method

Canonical position fields are defined in `data/mechanics/gameplay.json` (`positionOverallStats`). Only an EA individual-attribute leaf whose displayed label directly matches a canonical field counts as direct evidence. EA category summaries (Pace, Passing, Dribbling, Defending and Physicality) are not individual fields. For Dribbling, the recorded value is the second leaf explicitly named “Dribbling”, not the group heading. `Finishing` is not treated as `shootAccuracy`; `Heading Accuracy` is not treated as `heading`; and `GK Reflexes` is not treated as `gkSkill`. No EA-to-game conversion or formula is inferred. EA FC 27 player pages reflect launch Gold, Silver and Bronze Ultimate Team items and exclude other item types and later live-form updates in other modes; EA also notes club affiliations may change. Sources checked 2026-11-02.

`Game → EA` lists the ledger's broad primary position followed by EA's specific primary position. “Unresolved” means no directly matching individual EA leaf was observed for that canonical field.

## Identity and directly observed canonical fields

| Ledger player | Game → EA position | FC 27 source ID and official EA player page | Direct same-name canonical leaves | Unresolved canonical fields |
|---|---|---|---|---|
| Matěj Kovář | GK → GK | 242948 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/matej-kovar/242948) | `gkDiving` 76; `agility` 31; `strength` 55; `stamina` 28 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Nick Olij | GK → GK | 224241 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/nick-olij/224241) | `gkDiving` 78; `agility` 31; `strength` 52; `stamina` 26 | `gkSkill` (EA label is GK Reflexes); `passing` (EA Passing is a group summary) |
| Mauro Júnior | DF → LB | 241509 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/mauro-junior/241509) | `strength` 40; `aggression` 77; `stamina` 88 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Jerdy Schouten | DF → CB | 235149 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/jerdy-schouten/235149) | `strength` 75; `aggression` 73; `stamina` 73 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Sergiño Dest | DF → RB | 251804 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sergino-dest/251804) | `strength` 68; `aggression` 73; `stamina` 88 | `defence` (Defending group summary); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Lutsharel Geertruida | MF → CB **(discrepancy)** | 241187 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lutsharel-geertruida/241187) | `crossing` 70; `dribbling` 76 (leaf); `agility` 69; `stamina` 76 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Kodai Sano | MF → CM | 277809 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/kodai-sano/277809) | `crossing` 68; `dribbling` 82 (leaf); `agility` 83; `stamina` 86 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Sven Mijnans | MF → CAM | 254789 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/sven-mijnans/254789) | `crossing` 74; `dribbling` 75 (leaf); `agility` 76; `stamina` 88 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Alassane Pléa | MF → ST **(discrepancy)** | 206467 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/alassane-plea/206467) | `crossing` 79; `dribbling` 80 (leaf); `agility` 75; `stamina` 72 | `passing` (EA Passing is a group summary); `speedRating` (Pace summary) |
| Ivan Perišić | FW → LW | 181458 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ivan-perisic/181458) | `shootPower` 85; `dribbling` 77 (leaf); `agility` 73 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Ricardo Pepi | FW → ST | 251223 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/ricardo-pepi/251223) | `shootPower` 79; `dribbling` 72 (leaf); `agility` 69 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |
| Guus Til | FW → CAM **(discrepancy)** | 235663 — [EA player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/guus-til/235663) | `shootPower` 76; `dribbling` 73 (leaf); `agility` 68 | `shootAccuracy` (EA label is Finishing); `speedRating` (Pace summary); `heading` (EA label is Heading Accuracy) |

## Position check and result

Lutsharel Geertruida's EA primary position is CB while the ledger records MF; Alassane Pléa's is ST while the ledger records MF; and Guus Til's is CAM while the ledger records FW. These three cross-category discrepancies are recorded without changing roster assignments. The other nine positions fit their ledger broad GK, DF, MF or FW categories, including Ivan Perišić's FW → LW mapping. All twelve stable-ID pages identify the ledger's same-name player and PSV affiliation.

The individual pages expose **42 of 72** direct same-name canonical-field observations, leaving **30** unresolved slots. No player has all six position inputs directly observed under the conservative matching rule. No EA group summary or OVR was copied into game data; no tier, eligibility, or assignment was calculated or changed.

## Focused audit validation

- Membership: exactly twelve `cont_uefa_24` ledger rows, twelve distinct canonical player IDs, and twelve distinct EA source IDs; all twelve individual pages match the ledger identity and PSV affiliation.
- Position accounting: 9 broad-position matches and 3 discrepancies (Lutsharel Geertruida, Alassane Pléa, Guus Til).
- Identity/team conflicts: none; zero conflicted leaves excluded from trusted coverage.
- Field accounting: 42 trusted direct leaves + 30 unresolved fields = 72.
- Source-ledger SHA-256 before audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after audit: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Scope: only this dated audit report was created; roster data, source ledger, shared index, and backlog were not edited.
