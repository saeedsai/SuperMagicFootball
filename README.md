# Supermagic Football · v0.8.25.32 · Modular source project

This is a **continuation of v0.8.25.29**, which itself derives from the v0.8.25.28 handover. The game has NOT been recreated. Player IDs, team ordering, formation choices, controls, game modes, saved-progress keys and gameplay formulas are retained. The authoritative playable version now consists of **multiple JavaScript modules and JSON data files**; `index.html` loads those files at runtime.

## Play the game

You must serve the **entire extracted folder** through HTTP because browser ES modules and JSON `fetch()` cannot reliably run from `file://`. Requires only Python 3:

```sh
cd Supermagic_Football_Modular
python3 -m http.server 8000
```

Open **http://localhost:8000/index.html**. Windows: double-click `run_game_windows.bat`; macOS/Linux: run `./run_game.sh`. No build, Node package installation or internet connection is required for basic gameplay after initial local file loading. The service worker will cache the runtime for hosted offline/PWA use where allowed.

**Important:** `index.html` by itself is NOT a portable playable game; keep its linked `src/`, `data/`, `style.css`, `sw.js` and icon together. This release intentionally no longer ships a standalone root `play.html`. An inline **QA-only** fixture at `tests/.generated/play.html` is generated from the modular code to keep inherited browser regression harnesses functional; it is not the main app or an independent source of truth.

## Project layout

| Location | Purpose and parallel-edit ownership |
|---|---|
| `index.html`, `style.css` | Playable shell, menus, CSS; UI workstream |
| `src/main.js`, `src/assets.js` | Async startup, file loading, JSON validation; integration workstream |
| `src/modules/engine.js`, `fitness.js`, `shotfeel.js`, `ai.js`, `abilities.js`, `tactics.js` | Gameplay calculations, timings, AI, movement; gameplay workstream |
| `src/modules/render.js`, `artpose.js`, `bpwpersonality.js`, `identity.js` | Procedural vector art, graphics and animation; graphics workstream |
| `src/modules/ui.js`, `input.js`, `audio.js` | Screens, controls, customization persistence, audio; UI/controls workstream |
| `data/mechanics/gameplay.json` | Runtime gameplay config: formations, AI, dribble styles, shots, abilities, ball choices, default rules, field geometry and selected engine timings |
| `data/teams.json` | All 223 built-in team records, in stable numeric index order; team DB workstream |
| `data/players/*.json` | All 2,676 player records in seven independent roster shards; roster workstreams |
| `data/graphics/*.json` | Natural palettes, Studio options, 84 player-specific avatar records and art registry |
| `data/editorial/historical_rosters.json`, `data/confederations.json`, `data/continental_mapping.json` | BPW historic selections, tournaments and their preserved membership-index mapping |
| `tests/` and `docs/qa_runs_v082530/` | Regression suite and reproducible evidence; quality workstream |
| `scripts/validate_data.py`, `scripts/build.py` | JSON integrity validation and generation of compatibility QA fixtures |
| `docs/PARALLEL_DEVELOPMENT_GUIDE.md` | File-ownership, merge protocol and invariants for multiple development chats |

## Verify

```sh
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/*.test.cjs
python3 tests/modular_browser_integration.py
python3 tests/scripted_match_replays.py
```

Other inherited Chromium scripts in `tests/*.py` continue to run after generating the QA fixture; `tests/animation_contact_sheet_v082523.py` is evidence generation, not an acceptance suite. Chromium/Playwright are required for browser regression, not for playing the game.

## Compatibility and boundaries

- **223 teams / 2,676 players**; each team has 2 GK, 3 DF, 4 MF, 3 FW; original `index` and player `id` preserved.
- Modern, continental and BPW squads retain their editorial/source verification limitations. All 7 BPW squads, six formations and four gameplay buttons remain intact.
- User-created clubs are still appended **after the 216 initial teams and before the 7 BPW squads** to preserve historical saves.
- Player Studio appearance values and local-storage prefix (`legend_`) are preserved. A true browser-restart migration check is still required on a real origin.
- Parameter extraction is **partial**: gameplay.json is an active runtime configuration, but fine-grained numeric formulas remain in their dedicated engine modules. `data/mechanics/source_numeric_inventory.json` lists candidates for future extraction; editing that audit file has no runtime effect.
- Procedural graphics are **code** in the renderer modules, not an invented bitmap database. JSON stores editable palettes, options, and presets.
- Worldwide roster re-verification, Super Defense, Tricks and network modes remain deferred.

## Development branch update — v0.8.25.32 (2026-10-15)

Development started from GitHub commit `34dd3d3`. Changes live on `dev`; main remains the previous v0.8.25.30 release. New feature: **Graphics → Performance HUD** with rolling FPS and average frame-time readouts on phone and desktop; enabled/disabled in standard settings, default OFF. Also moved seven previously hard-coded tuning constants to JSON without changing defaults, and improved failed JSON-loading recovery with a Retry button.

Run `python3 scripts/validate_data.py && python3 scripts/build.py && node --test tests/*.test.cjs`. For browser checks run `python3 tests/modular_browser_integration.py`, `python3 tests/performance_loader_browser_v082531.py`, and `python3 tests/scripted_match_replays.py` after installing Playwright/Chromium. Details: `docs/TEST_REPORT_v082531.md`.

**Important: GitHub Pages builds a selected branch, not every branch at once.** To publish the dev version on GitHub Pages, set **Settings → Pages → Deploy from a branch → dev / (root)**. This changes which branch is live. You can instead retain main live and use a separate host for dev. Do not assume `https://saeedsai.github.io/SuperMagicFootball/` is the dev build until a real deployment and browser check succeeds.

## v0.8.25.32 graphics release

Open **Settings → Player Customization → Player Studio**, then select **COMPARE ALL 8 VIEWS**. The optional gallery shows the currently edited character from every direction, including separate rear crown styles for all 13 haircuts. Toggle without losing unsaved appearance values; click **SAVE CHARACTER** to persist changes. The default Studio view and all gameplay controls are unchanged.

For this iteration's coverage and five-step plan, see [docs/TEST_REPORT_v082532.md](docs/TEST_REPORT_v082532.md), [docs/NEXT_MILESTONES.md](docs/NEXT_MILESTONES.md) and [docs/GAP_REGISTER_v082532.md](docs/GAP_REGISTER_v082532.md). Hosting/save-restart and physical mobile/PWA certification are **far-future**, not scheduled in the next five releases.
## Integrating JSON edits from simultaneous agents

Use `python3 scripts/parallel_data_merge.py --base <common-ancestor-checkout> --ours <agent-a-checkout> --theirs <agent-b-checkout> --check` to locate conflicts in teams, players, appearance and mechanics JSON before integration. Disjoint fields are combined by player ID; conflicting fields, protected roster/ID ordering changes, and deletion-versus-modification are reported rather than silently accepted. Review [the parallel-data merge guide](docs/PARALLEL_DATA_MERGE_GUIDE.md), then run all CI gates before pushing `dev`. The script does not change the playable game or verify external FC27 ratings.

## Editable pass and goalkeeper balance (v0.8.25.34, 2026-10-16)

The playable `src/modules/engine.js` now loads two bounded groups from `data/mechanics/gameplay.json`: `physicsTuning.passSpeed` and `physicsTuning.keeperDiveRecovery`. All coefficients retain the previous values until explicitly edited; the pure helper is in `src/modules/physicsbalance.js`. Incorrect types, out-of-range values and inconsistent min/base/max settings fail startup rather than silently destabilizing the match. See [ENGINE_PHYSICS_TUNING_20261016.md](docs/ENGINE_PHYSICS_TUNING_20261016.md) for keys, ranges, regression tests and editing instructions. QA fixtures and the service-worker module registry include the helper; this keeps the project independently editable by multiple agents. Historical roster and player-art source assets are unchanged.

## 16 October 2026 — safe multi-agent merge checkpoint and confirmed QA

Development commit [`e5f3b3b`](https://github.com/saeedsai/SuperMagicFootball/commit/e5f3b3bd3870aca8f776127e02320b3a09b4a461) adds a guard against numeric team-index changes during a three-way JSON merge and a bounded `changeSummary` preview for each agent. These are **tooling changes only**; current football runtime, player data, and save schema are unchanged. Exact-code CI: [Full Regression Census 140/140](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38874249591), [Modular QA 14 Python + 53 Node subtests](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38874249374). GitHub Pages deployed successfully, and a fresh hosted [desktop + simulated touch smoke](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38862708843) confirmed the playable game loads and starts a match. See [the detailed checkpoint QA](docs/QA_PARALLEL_MERGE_CHECKPOINT_20261016.md) for scope/limitations.

## Owner gameplay balance patch — 16 October 2026

The modular game now applies bounded `data/mechanics/gameplay.json` `physicsTuning.superShot` controls: **Super Shot launch velocity 0.96×** (4% slower) and **Super Shot/combo-super fatigue cost 1.08×** (8% more). Normal shots/passes are unchanged. A keeper that catches the ball now carries the ball **at glove height** during a visible short possession state and distributes through the existing short/long routine; AI releases earlier if opponents get close. The follow-on request for *more active diving* is in the next five-iteration plan and has not yet been represented as complete. Run `python3 scripts/validate_data.py && python3 scripts/build.py && node --test tests/*.test.cjs`, then the new `tests/super_keeper_balance_browser_qa.py` and the full regression census. Detailed feature contract: [Super Shot and keeper hands](docs/SUPER_SHOT_KEEPER_HANDS_20261016.md).

## Verified integration-tool checkpoint (16 October 2026)

The parallel data merge helper now blocks dangling player/team artwork references in complete three-way merges and rejects QC `--report` destinations inside any source/output tree. To preflight an agent merge: `python3 scripts/parallel_data_merge.py --base BASE --ours OURS --theirs THEIRS --check --report /tmp/smf-merge-report.json`; see `docs/PARALLEL_DATA_MERGE_GUIDE.md` for required shared ancestor and directory isolation. New feature-code checkpoint `9e3a52c` passed 17 Python merge tests, 59 active Node tests and 144 full regression scripts (94 Node + 50 Chromium); full detail at `docs/QA_PARALLEL_GRAPHICS_REFERENCE_20261016.md`. Runtime assets were not changed. The public game URL remains https://saeedsai.github.io/SuperMagicFootball/; deployment was successful for that code commit. Physical-device certification remains open.
