# Supermagic Football v0.8.3 — test and validation report

**Date:** 2026-10-13. **Environment:** Node.js 22, Chromium with Playwright on desktop 1366×800 and simulated Android landscape 844×390; no real hardware gamepad or phone available.

## Completed validation

| Group | Result | Coverage |
|---|---|---|
| `npm test` | **PASS 13 / 13 suites** | Full existing Node set + new AI combo script; 216 teams, 2,592 player slots, six continental cups and 151 tournament entries, career, stats, stamina, substitutions, abilities, morale, tactics, kits, team combos, shooting and CPU difficulty |
| `tests/ai_team_combos.mjs` | **PASS** | Rookie exclusion; Expert timing and transformed ball metadata; one launch per cooldown; candidate distance; helper movement; no auto-hijack of manually controlled player; stale-chase fix |
| `tests/ai_combos_browser_qa.py` | **PASS desktop + simulated Android** | Standalone HTML launches, AI auto combo setup, transformed apex shot and screenshot inspection; no JavaScript page errors |
| `tests/team_combos_browser_qa.py` | **PASS desktop + simulated Android, repeated three consecutive runs after bug fix** | Keyboard + real Chromium touch gestures for human launch/special; verifies intermittent chase interruption fixed |
| Existing browser regression suite | **PASS by individually run suites** | Tactics, kits, Quick Match, continental tournaments, manager career, save export/import, AI difficulty, player stats, fitness, morale, defensive GK abilities, aerial controls, team combos and fullscreen |
| Standalone build | **PASS** | `python tests/build.py`, self-contained inline HTML script and styles |
| Full combined `npm run qa` | **TIMEOUT after 7 suites** | The first seven passed and all remaining scripts were tested individually; do not interpret the interrupted combined command as a full pass |

**Discovered and resolved:** an intermittent v0.8.2 regression caused pre-existing chase state to trigger a slide tackle during an aerial combo. Confirmed via three-dimensional ball/player debug fields and fixed in core engine, with regression coverage.

## Still unverified

Real Android/iOS devices, Bluetooth gamepads, installed offline PWA on phones, Safari/Firefox, true online play, 60 fps on low-end devices, full-season human input balancing, exact 1993 move timing, historical ball riding and 20+ unique high-quality illustrated player faces.
