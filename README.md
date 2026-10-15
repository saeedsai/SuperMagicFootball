# Supermagic Football · v0.8.25.31 · Modular source project

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

## Development branch update — v0.8.25.31 (2026-10-15)

Development started from GitHub commit `34dd3d3`. Changes live on `dev`; main remains the previous v0.8.25.30 release. New feature: **Graphics → Performance HUD** with rolling FPS and average frame-time readouts on phone and desktop; enabled/disabled in standard settings, default OFF. Also moved seven previously hard-coded tuning constants to JSON without changing defaults, and improved failed JSON-loading recovery with a Retry button.

Run `python3 scripts/validate_data.py && python3 scripts/build.py && node --test tests/*.test.cjs`. For browser checks run `python3 tests/modular_browser_integration.py`, `python3 tests/performance_loader_browser_v082531.py`, and `python3 tests/scripted_match_replays.py` after installing Playwright/Chromium. Details: `docs/TEST_REPORT_v082531.md`.

**Important: GitHub Pages builds a selected branch, not every branch at once.** To publish the dev version on GitHub Pages, set **Settings → Pages → Deploy from a branch → dev / (root)**. This changes which branch is live. You can instead retain main live and use a separate host for dev. Do not assume `https://saeedsai.github.io/SuperMagicFootball/` is the dev build until a real deployment and browser check succeeds.
