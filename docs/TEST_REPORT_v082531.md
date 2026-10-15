# Supermagic Football v0.8.25.31 — Regression and release QA (2026-10-15)

## Baseline and scope
Baseline: GitHub `saeedsai/SuperMagicFootball` `main` and `dev` head `34dd3d367997b76ac4030f564db3b8e75f76ee21` at start. The modular v0.8.25.30 package was used as the runnable local source mirror; engine and HTML file blob hashes were checked against GitHub. The patch is committed ONLY to the `dev` branch; production `main` remains untouched.

## Results

| QA group | Pass | Fail | Timeout | Not executed |
|---|---:|---:|---:|---:|
| Node regression and new feature tests | 143 | 0 | 0 | 0 |
| Inherited Chromium acceptance scripts (20 separate suites) | 20 | 0 | 0 | 0 |
| Real multi-file import/JSON Chromium integration | 9 | 0 | 0 | 0 |
| Performance overlay and failure recovery Chromium | 11 | 0 | 0 | 0 |
| Scripted complete matches | 24 | 0 | 0 | 0 |
| Real hosted browser restart, physical devices, GitHub-dev publication | 0 | 0 | 0 | 4 |

These rows mix assertions, suites, and replays, so **207 PASS** is the catalog count only, not 207 distinct browser suites. There are **0 failures and 0 timeouts among completed suites**. The character persistence suite itself also records 3 environment-dependent NOT EXECUTED cases; do not double-count them as passing.

## Fixed and added
- Five Node tests check FPS option and default, tunable balance parity, unchanged four actions, failed-JSON retry, updated SW cache.
- New `tests/performance_loader_browser_v082531.py` covers 2 layouts, setting persistence in the running session, live FPS, pausing and broken fetch recovery, all passing.
- Previously hard-coded attack final-third threshold, special-shot knockback factors, and keeper prediction horizon now use validated `mechanics/gameplay.json` fields, all with **identical default values** to preserve gameplay.
- Fixed stale v0.8.25.30 assertions in inherited Node and Chromium tests; their behavioral assertions passed independently. No physics, squads, BPW members, IDs or controls changed.
- Data validator: 223 teams, 2,676 players, exact 2 GK/3 DF/4 MF/3 FW quota, all original BPW slots, graphics presets and new balance bounds PASS.

## How to reproduce

```sh
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/*.test.cjs
python3 tests/modular_browser_integration.py
python3 tests/performance_loader_browser_v082531.py
python3 tests/scripted_match_replays.py
# Remaining inherited suites live under tests/*.py and are summarized in docs/QA_INHERITED_BROWSER_v082531.json
```

On desktop and simulated mobile, Chromium uses intercepted `https://supermagic.test/...` asset requests because this execution environment blocks direct localhost navigation. That verifies separate module imports and JSON loading, **not** a persistent public host. Genuine hosted-origin cache/install, saved-data restart and live GitHub Pages playback are NOT VERIFIED. Physical iOS/Android devices remain NOT EXECUTED. Failure to verify public Pages is a hosting gap, not proof that the game code fails.

## Hosting / publication limitation
A commit on `dev` does **not** automatically publish to GitHub Pages while Pages is set to publish `main` (or if Pages has not been enabled). GitHub repository settings control the source branch. The public URL `https://saeedsai.github.io/SuperMagicFootball/` is the *expected production URL*, not a certified development preview. To preview the updated build on phone and PC, a repository administrator must select **Settings → Pages → Deploy from a branch → dev / (root)** (temporarily replacing a main preview), or deploy `dev` with an approved separate hosting service. Verify in Safari/Chrome after GitHub reports a successful deployment.
