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

Next five **separately claimed** suggested club batches: PSG `club26_3`, Barcelona `club26_4`, Manchester United `club26_5`, Real Madrid `club26_7`, and Tottenham `club26_29` (check live claims first).

## Observed GitHub CI and deployment on integrated `dev`

- **Manchester City code** entered `dev` in separate SHA-checked content commits due concurrent GitHub branch movement: [club source `4b9e4f5`](https://github.com/saeedsai/SuperMagicFootball/commit/4b9e4f56b7df85dd2599965a09000bd64e90a187), [runtime mirror `ade18e3`](https://github.com/saeedsai/SuperMagicFootball/commit/ade18e359b1fb5263e7f444c3b70334d21cd7f28), [immutable audit `6eca126`](https://github.com/saeedsai/SuperMagicFootball/commit/6eca126c8421f97d7ba611b4a5c059e152f7bac2), and [test `e9a19bb`](https://github.com/saeedsai/SuperMagicFootball/commit/e9a19bb27b931a939c482e69116770bdb797ab56). No unrelated roster records were touched; current source/runtime City records must be equal.
- [Integrated source QA #38914786704](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38914786704) and [later source QA #38914846855](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38914846855): **169 / 170 active Node tests PASSED**, including **3 / 3 Manchester City tests** and 165-club, 1,980-player roster and immutable history verification. **One unrelated failure**: `tests/project_memory_contract.test.cjs` asserts `wrong identity for game-developer-6`. This belongs to the separately claimed `project-context` memory scope; [issue #8](https://github.com/saeedsai/SuperMagicFootball/issues/8) tracks it. Do not modify another agent's memory to force green CI.
- [Full Regression Census #38914846852](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38914846852) failed its active Node preflight on **the same memory identity mismatch**; historical Node shards and Chromium browser shards were **SKIPPED**, not successful. This does not establish gameplay regression success/failure.
- [Pages run #38914786259](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38914786259) was **CANCELLED** due rapidly advancing `dev`; the subsequent Pages build status requires a fresh exact-commit check. Public URL [https://saeedsai.github.io/SuperMagicFootball/](https://saeedsai.github.io/SuperMagicFootball/) was attempted via a public-page fetch but not accessible through that checker. **Hosted desktop, mobile touch and physical-device play are NOT independently verified**.
- The delivered ratings are official EA Ultimate Team **launch base cards**; 12 / 12 overall and 72 / 72 face attributes needed no numerical edits. Five shirt numbers, five shirt-verification flags, five missing ages, twelve heights and 36 provenance field edits account for the **63 per-player field changes**.

**Handoff**: Manchester City player work finished; release `roster-club-club26_2`. Only after checking the latest claims, reserve PSG `club26_3` for the next independently verifiable club. The memory identity failure is an existing unrelated QA blocker; allow its owner to resolve issue #8 before asserting all-green regression and Pages deployment.

## Later integrated CI success (supersedes initial memory blocker)

- On integrated `dev` SHA **`6fe944059b8634a4673d5e3f6d0addc2ef1a7884`**, the [Modular Game Dev QA run #38915465084](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915465084) completed **SUCCESS: 171/171 active Node tests passed, 0 failed**. This includes all **3 Manchester City tests**, all 165-club squad quotas, and immutable roster-history validation.
- The earlier wrong-memory-identity failure was repaired by another agent (not by the City roster owner); prior failed run logs remain historical evidence only.
- The same integrated SHA's [GitHub Pages build and deployment #38915464957](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915464957) completed **SUCCESS** (build, deploy and status report all green). Public URL: https://saeedsai.github.io/SuperMagicFootball/ .
- [Full Regression Census #38915344074](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915344074) used a separate **earlier** integrated SHA `34604826aa552e493885c12870cdbf9bc6b662cf`, passed its preflight and all **four historical Node shards**; at this checkpoint, its four Chromium browser shards were **still in progress**. This is not an all-green historical browser certification until the run finishes.
- A live public URL fetch from this environment was unavailable. Successful GitHub Pages deployment is evidence that the hosted build was deployed, **not** an independently observed touchscreen/PC interactive match or physical-phone playthrough.
