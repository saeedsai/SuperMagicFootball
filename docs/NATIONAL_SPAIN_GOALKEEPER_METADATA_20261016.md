# Spain national goalkeeper DOB/height correction — 16 October 2026

**Claim:** `NATIONAL-SPAIN-GK-METADATA-B2`, exclusive `roster-national-national26_0`, owner `roster-spain-goalkeeper-metadata-20261016-gpt6-session9`.

## Scope and reproducible primary evidence
The playable game had implausibly low ages for Spain's two goalkeepers, although their identities, positions and editorial game scores were already in place. This **small two-person data correction** uses official records and completed birthdays as of **2026-10-16**, not a guessed season age.

| Stable player ID | Name | Official date of birth | Previous age | Verified age | Height | Preserved rating |
|---|---|---|---:|---:|---:|---:|
| `national26_0_0` | David Raya | 1995-09-15 | 22 | **31** | **183 cm** | 97 (editorial arcade) |
| `national26_0_gk_12` | Unai Simón | 1997-06-11 | 24 | **29** | **190 cm** | 95 (editorial arcade) |

Official / competition registry sources:
- [LaLiga, David Raya Martín](https://www.laliga.com/en-ES/player/david-raya-martin): DOB 15-09-1995, height 183 cm, Spain goalkeeper; [Premier League, David Raya](https://www.premierleague.com/players/7975/David-Raya-Martin/overview) independently corroborates DOB and height.
- [Athletic Club official Unai Simón profile](https://www.athletic-club.eus/en/players/unai-simon-mendibil/): DOB 11 June 1997, height 1.90 m; [LaLiga Unai Simón](https://www.laliga.com/en-GB/player/unai-simon) independently corroborates 190 cm and birth date.

Player `source` strings remain unchanged: one describes the original *World Cup squad sample*, and the other describes the editorial keeper selection requiring squad-membership verification. These new official references establish **personal age/height only**, not 2026 World Cup selection, gameplay skill, international eligibility, FC27 ratings or shirt-number accuracy.

## Implementation and compatibility
- **Only** two objects under `national26_0` in `data/players/national26.json`: `age` corrected and optional `heightCm` inserted.
- All 32 national squads still contain 12 entries; Spain retains **2 GK / 3 DF / 4 MF / 3 FW**. IDs, slots, names, national shirts, roles, shot skills, stats, values, editorial ratings and game team index **13** stay unchanged. The earlier Pedri 23/Gavi 22, both 174 cm correction remains intact.
- No change to any club roster, other 31 national rosters, `src/modules/engine.js`, `src/modules/ui.js`, gameplay balance, artwork, CI workflows, shared QA runners, service worker, save-game schema, menu buttons or formations.
- **Node acceptance:** `tests/spain_goalkeeper_metadata_20261016.test.cjs`: as-of-date DOB computation, official heights, stable GK fields, 32 × 12 roster cardinality, unchanged Spanish positional quotas and prior Spain midfield metadata.
- **Real playable browser acceptance:** `tests/spain_goalkeeper_metadata_browser_qa.py`: build the modular game with `python3 scripts/build.py`, then exercise `SupermagicFootball.rosterFor(13)` and `game.init()` in Chromium desktop and simulated touch. Match the real match roster to source data; verify two GK identities/ages/heights, 12 slots and untouched Pedri/Gavi. Separate game and browser exceptions fail the test.

## Tests and release evidence
- Source commit: [`8eda1a230bd6b2cea1b85f329154d5239e97d5ba`](https://github.com/saeedsai/SuperMagicFootball/commit/8eda1a230bd6b2cea1b85f329154d5239e97d5ba).
- Node test commit: [`eca765545ccea84dac6cc9a566f0694f47cc4f0f`](https://github.com/saeedsai/SuperMagicFootball/commit/eca765545ccea84dac6cc9a566f0694f47cc4f0f).
- Browser test commit: [`bfaf9c248269c7afc979835680240a7e59602c2d`](https://github.com/saeedsai/SuperMagicFootball/commit/bfaf9c248269c7afc979835680240a7e59602c2d).
- [Modular Game Dev QA #38900408270](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900408270) **SUCCESS** on the browser-test commit; active Node tests and data validity passed.
- [Full Regression Census #38900429370](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429370) was queued on a later integrated `dev` source (that includes these commits). **Exact final results should be recorded below only after all shards finish.**
- Public playable link: https://saeedsai.github.io/SuperMagicFootball/ ; verify hosted desktop and simulated-touch smoke separately. Do not imply physical iPhone/Android device tests.
- [Issue #2](https://github.com/saeedsai/SuperMagicFootball/issues/2) remains: source-only edits to `data/players/national26.json` or these particular tests do **not** themselves trigger Full Regression Census. The `release-infra` claim is active, so no workflow edits were made under this per-national-team claim.

## Housekeeping and downstream requirements
Generated browser fixtures, Node dependencies, Python bytecode and screenshot scratch are already ignored and must not be committed. Do not remove older art plans, history ledgers or test reports relied on by other agents. Preserve all currently playable teams and original roster IDs.

**Open work:** real source audit of other eight Spanish outfield players, national call-up membership, physical real-device browser QA, PWA installation/restart, graphics/keeper directional poses, keeper real-match balance and network play.

### Next five short iterations
1. An authorized `release-infra` owner resolves issue #2 and certifies source-only national-team changes automatically with full regression.
2. A new Spain `roster-national-national26_0` owner source-checks 2–3 more outfield player DOB/height values, without altering scores.
3. Gameplay owner interprets seeded keeper-save/goal outcomes and tunes only if actual corner bias is reproduced.
4. Graphics owner continues editable face/keeper glove/release visuals with fallback renderer and visual screenshots.
5. UI/career owner refines substitution and halftime fitness coaching, followed by physical mobile and PWA smoke milestones.

**Handover:** release this claim only after doc/tests/source are committed and final available QA evidence recorded; next agent re-reads live AGENTS/claims first.
