# Manchester City — FC 27 launch player ratings and 2026/27 biographies (16 October 2026)

**Club:** `club26_2` | **Agent:** `roster-fc27-chat-20261016-city-b1` | **Lock:** `roster-club-club26_2`
**Immutable metadata batch:** `CLUB-20261016-MCI-FC27-VERIFICATION-1`

## Work completed

- Cross-referenced **12/12 Manchester City base-card overall ratings** and **72/72 PAC, SHO, PAS, DRI, DEF, PHY face stats** with [EA's official FC 27 Manchester City table](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/manchester-city/10); **none required a numerical adjustment**.
- Cross-checked **12/12 active Manchester City squad registrations** and shirt numbers against the [Premier League's 2026/27 registered squad lists](https://www.premierleague.com/en/news/4706139/see-all-the-202627-premier-league-squad-lists) and [official 2026/27 numbers](https://www.premierleague.com/en/news/4725682/all-20-premier-league-clubs-squad-numbers-for-202627-season) (22 Sep 2026).
- Corrected **five shirt numbers**: Gvardiol **2→24**, Guéhi **4→6**, Matheus Nunes **6→27**, Cherki **7→10**, Semenyo **8→42**. Set **five newly verified shirt flags**.
- Filled **five absent ages** using DOB on 2026-10-16; added **12 absent heights**, cross-checking player names, country and date of birth against the [2026/27 FootballSquads Manchester City records](https://footballsquads.co.uk/eng/2026-2027/engprem/mancity.htm).
- Repointed the `source`/ `ratingSource` on all 12 players from the historical unofficial snapshot to official EA FC 27 base-card table and marked `fc27OfficialCheckedAt`; retained each original `sourceSnapshot` for provenance.
- Retained **all 12 stable IDs, names, birth dates, nations, in-game role slots, OVR, official EA face stats, arcade gameplay stats, and every other club**. `statsVerified:false` still correctly describes *game-specific* arcade stats, not EA Ultimate Team headline attributes.

## Verified roster snapshot

| Player | Game role | FC27 OVR | 26/27 shirt | Age (2026-10-16) | Height (cm) |
| --- | --- | ---: | ---: | ---: | ---: |
| Gianluigi Donnarumma | GK | 89 | 1 | 27 | 196 |
| Gerónimo Rulli | GK | 80 | 28 | 34 | 189 |
| Rúben Dias | DF | 87 | 3 | 29 | 187 |
| Joško Gvardiol | DF | 85 | 24 | 24 | 185 |
| Marc Guéhi | DF | 85 | 6 | 26 | 182 |
| Elliot Anderson | MF | 84 | 5 | 23 | 175 |
| Phil Foden | MF | 84 | 47 | 26 | 171 |
| Jérémy Doku | MF | 84 | 11 | 24 | 179 |
| Matheus Nunes | MF | 83 | 27 | 28 | 183 |
| Erling Haaland | FW | 91 | 9 | 26 | 195 |
| Rayan Cherki | FW | 86 | 10 | 23 | 177 |
| Antoine Semenyo | FW | 85 | 42 | 26 | 178 |

## Caveats / open gap

- EA labels these as **Ultimate Team launch Gold/Silver/Bronze cards**; do not imply that they match form updates or later campaign cards.
- The game's 2GK/3DF/4MF/3FW structure intentionally places **Doku in MF** (EA LW), **Cherki in FW** (EA RW), and **Matheus Nunes in MF** (EA RB); no role reclassification in this roster-metadata batch.
- Height publications sometimes disagree; these 12 heights match the named 2026/27 FootballSquads source, not a claim of universal physical measurement authority.
- The no-gameplay-edits requirement means neither graphics/UI/engine nor controller compatibility can be altered in this batch. Hosted phone/desktop play must be independently observed; a Pages build alone is not interactive verification.

## Test and deployment checkpoint

Dedicated `tests/man_city_fc27_official_20261016.test.cjs` checks 12 OVR + 72 face stats, 12 league numbers, DOB/age, nationality, height, source/runtime mirror and field-level ledger. To run: `python3 scripts/validate_data.py`; `node --test tests/man_city_fc27_official_20261016.test.cjs`; `node --test tests/*.test.cjs`; roster history census and `python3 scripts/build.py`. Verify GitHub's **Modular Game Dev QA**, **Full Regression Census**, and Pages workflows by **exact source SHA**. Track unresolved/cancelled independently.

Next five **separately claimed** suggested club batches: PSG `club26_3`, Barcelona `club26_4`, Manchester United `club26_5`, Real Madrid `club26_7`, and Tottenham `club26_9` (check live IDs/locks first).
