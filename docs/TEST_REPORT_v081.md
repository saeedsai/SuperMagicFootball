# Supermagic Football — v0.8.1 Test and Validation Report

**Date:** 13 October 2026. **Environment:** Node v22, Linux Chromium via Playwright. **No real-phone or hardware-controller testing.**

| Suite | Result | Coverage |
|---|---|---|
| `npm test` (11 Node suites) | PASS (run after test file correction) | Simulation, kits, all 216 team identities, career, six continental tournaments (151 entry slots), tactics, AI difficulty, stats, stamina/substitutions, morale, previous defensive/GK abilities and new aerial mechanics |
| `tests/aerial_mechanics.mjs` | PASS | Hyperdash stamina/cooldown/state persistence, controlled sprint behavior, 3D-range header validation, normal keeper interception & reversal, super ability retention |
| `tests/aerial_browser_qa.py` | PASS desktop + emulated Android | Real keyboard RUN+direction, SHOOT/Space, simulated multitouch RUN+joystick, SHOOT, JUMP; screenshots and no JS page errors |
| `tactics_browser_qa.py`, `kits_browser_qa.py` | PASS desktop + mobile | Tactical setup / live changes, kit appearance and match UI |
| `v060_qa.py`, `manager_v060.py`, `save_filter_v060.py` | PASS desktop + mobile | Continental campaigns, manager career, team lists, old-save import and current v0.8.1 JSON export |
| `ai_browser_qa.py`, `stats_browser_qa.py`, `fitness_browser_qa.py` | PASS desktop + mobile | AI levels, player stats, substitutes and recovery |
| `morale_browser_qa.py`, `abilities_browser_qa.py` | PASS desktop + mobile | Team talks, crying, existing keeper/defensive super skills |
| `fullscreen_brand_qa.py` | PASS desktop + emulated Android | Fullscreen/fallback UI, PWA metadata, save import/export |

**Execution note:** The first batch browser runner hit a tool timeout after eight suites, and an old save test expected the previous version string. The version assertion was updated to v0.8.1 and all remaining suite scripts were rerun individually, passing. New aerial UI tests also needed a keydown hold across an animation frame rather than instantaneous press; the test now uses real held input.

## Not covered or not finished

Physical gamepads, actual Android and iOS phones, Firefox/Safari, hosted PWA installation/cache reload, network multiplayer, extensive human-play balance and original NES frame parity. Hyperdash is hold-to-activate (not verified double tap). Team stacking and original game aerial-combination mechanics are still missing. These limitations remain tracked in the living roadmap; do not promote them to DONE.
