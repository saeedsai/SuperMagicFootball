# Spain national-team factual metadata — 16 October 2026

**Feature:** `NATIONAL-SPAIN-AGE-HEIGHT-B1`, claim `roster-national-national26_0`. Owner `roster-spain-birthdates-20261016-gpt6-01`. National source team `national26_0` (Spain, playable team index 13). Based on live `dev` head `94af2d2f587b5153b0259ada9fde0d767b94628c`; check the latest head again before any follow-up push.

## Bounded, independently sourced correction

Player IDs, names, roster order, positions, shirt numbers and arcade ratings **unchanged**. Date basis: **16 October 2026**; ages are completed birthday years, not the 2026–27 season number. These corrections do not imply verification of the exact World Cup 2026 squad or EA/FC ratings.

| Stable player ID | Name | DOB (club source) | Old age | Verified age | Height (cm) | Role | Rating left intact |
|---|---|---|---:|---:|---:|---|---:|
| `national26_0_11` | Pedri | 25 Nov 2002 | 33 | **23** | **174** | MF | 97, editorial |
| `national26_0_8` | Gavi | 5 Aug 2004 | 30 | **22** | **174** | MF | 97, editorial |

**Primary sources:** FC Barcelona official [Pedri profile](https://www.fcbarcelona.com/en/football/first-team/jugadors/70486/pedri) (DOB 25/11/2002; height 174 cm); FC Barcelona official [Gavi profile](https://www.fcbarcelona.com/en/football/first-team/jugadors/116719/---------------gavi) (DOB 05/08/2004; height 174 cm). Independent league confirmation: [Gavi, LaLiga](https://www.laliga.com/en-GB/player/gavi), DOB 05-08-2004, height 174 cm. The existing generic `source` string remains unchanged because it describes the historical **squad sample**, not the newly validated DOB/height; this document is the per-field source ledger.

## Precise implementation boundary
- `data/players/national26.json`: changed *only* `age` and added optional `heightCm` on Pedri and Gavi of **Spain**. Other 31 national teams, all 165 clubs and the game’s editable mechanics, kits, controls, graphics, UI, setup, save schema and rating formulas were not edited.
- `tests/spain_national_metadata_20261016.test.cjs`: DOB-derived age contracts on exact as-of date, club-sourced height, national squad 32 × 12 cardinality, stable player IDs/shirts, Spain 2 GK / 3 DF / 4 MF / 3 FW, protected editorial rating 97 and unchanged squad inclusion provenance.
- `tests/spain_national_metadata_browser_qa.py`: tests actual modular browser runtime in desktop and emulated touch; verifies public `rosterFor` → `game.init` uses the two corrected players, keeps 12 players and correct Spain team ID with no JS errors. Run using `python3 scripts/build.py && python3 tests/spain_national_metadata_browser_qa.py`.
- No tracked generated fixtures or temporary folders were deliberately added or deleted. The existing ignores and historical QA/provenance archives protect other agents' work.

## Regression and integration evidence
- Core `Modular Game Dev QA` on source/test commit [`07809e10451459dece063f26a77d51be7cfbf113`](https://github.com/saeedsai/SuperMagicFootball/commit/07809e10451459dece063f26a77d51be7cfbf113) completed **SUCCESS**, including discovered Node `*.test.cjs` scripts and JSON schema validation: [run 38898160141](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898160141).
- Full Regression Census may **not automatically trigger** on `data/players/national26.json` or this new specific test path because the current workflow path filter lacks these paths. **Do not change another agent's active release-infra lock.** Full browser results must be checked from the next integrated, eligible `dev` source revision, or the release owner can add these paths after handoff.
- Pages smoke should be verified after the published revision and reported as Chromium desktop plus simulated touch, not physical hardware certification.

## Remaining data gaps
The **other ten Spain player ages** remain unverified; their existing values might be placeholder ages (e.g., David Raya). Current national squad membership, official kit, current 2026/27 club, physical attributes of the remaining players and historical/all-time ratings require separate sourced batches. Do **not** infer accurate values just from the game's current high arcade rating. All 31 other national teams remain a separate ownership task.

## Next five small development iterations
1. Add `data/players/national26.json` and national metadata browser tests to full CI path triggers *after* release-infra is free; certify source-to-playable build and public PC/touch game.
2. Source-check another two or three Spain national players' ages/heights; keep one per-team claim and explicit dated evidence.
3. Run true keeper outcome calibration with natural AI active, accounting for corners, Super Shot variation and zero duplicate save events; respect active gameplay owner.
4. Continue editable player graphics/art under the artwork owner's roadmap, preserving renderer fallback and official roster IDs.
5. Continue formation/coaching feedback and provenance-aware data merges in separate UI/integration claims, with saved-game compatibility.

## Handover / lock release
After final QA records, release `roster-national-national26_0` with this file as link and exact commit SHA. Another agent must re-read `AGENTS.md`, coordination rules and current lock before continuing Spain.

## CI verification checkpoint (16 October 2026, later integrated SHA)
- [Full Regression Census #38898721461](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898721461), source `d9c7274c265ecb88d4269cf2e8d6b014c5fbf947` (descendant of Spain metadata and new tests): preflight **PASS**, all four Node shards **111/111 PASS** (28+28+27+28), including `spain_national_metadata_20261016.test.cjs`. The four browser shards were **in progress** at first reporting, so the test suite is **not yet certified 100%**; check exact run outcome before claiming it.
- [Hosted live desktop/touch smoke #38891468528, attempt 4](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528): **SUCCESS**, desktop and simulated-touch both HTTP 200, menus, teams, kickoff, extended pitch and active match (224 teams). Not physical devices. Public URL: https://saeedsai.github.io/SuperMagicFootball/.
- [GitHub issue #2](https://github.com/saeedsai/SuperMagicFootball/issues/2) tracks missing national-team source/test paths in full-census push triggers. This is out of scope while the separate `release-infra` claim is active. The full census above was triggered by a concurrent eligible graphics-source change.
- Repository tree audit found **no tracked** `__pycache__`, `.generated`, `node_modules`, Playwright report, `.pyc`, `.tmp`, `.bak`, or editor swap files. Existing historical tests and graphics provenance are needed; do not delete them.

### Full regression certified — exact integrated source checkpoint
- [Full Regression Census #38898721461](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898721461) **completed SUCCESS**, based on integrated source [`d9c7274c265ecb88d4269cf2e8d6b014c5fbf947`](https://github.com/saeedsai/SuperMagicFootball/commit/d9c7274c265ecb88d4269cf2e8d6b014c5fbf947), a descendant containing the Spain data and both national metadata tests.
- Preflight **PASS**. Four Node shards: **28 + 28 + 27 + 28 = 111/111 PASS**; this includes `spain_national_metadata_20261016.test.cjs` in shard 0. Four Chromium shards: **15 + 15 + 15 + 15 = 60/60 PASS**, including `spain_national_metadata_browser_qa.py` (actual modular engine source/runtime parity and desktop + simulated touch). Total **171/171 executable test scripts PASS**, 0 fail, 0 error, 0 timeout, 0 not-run.
- [Hosted desktop and simulated touch smoke #38891468528 attempt 4](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **SUCCESS**: the deployed GitHub Pages page returned HTTP 200 on desktop and touch Chromium, selected teams, entered kickoff, exercised the +20% field and verified active match, 224 teams. The public URL is https://saeedsai.github.io/SuperMagicFootball/. This is browser emulation, not physical iOS/Android device testing.
- New coverage gap [issue #2](https://github.com/saeedsai/SuperMagicFootball/issues/2) remains **open**: national data alone does not yet trigger the Full Regression Census. This iteration was certified because concurrent graphics changes legitimately triggered the census; the issue needs a separate release-infrastructure owner when that lock is free. Do not falsely mark this infrastructure gap closed.
- After this source SHA, later documentation commits do not alter the validated Spain data or both test scripts. Concurrent agents may still advance `dev`, so future work must re-check the exact source ancestry and GitHub statuses.
- **Outcome:** this small factual player metadata batch is complete and can release its exclusive Spain claim. Other ten Spanish player DOB/physical records and other national teams are separate future evidence-backed batches.
