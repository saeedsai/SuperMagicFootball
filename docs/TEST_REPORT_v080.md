# Supermagic Football — v0.8.0 Alpha Test & Regression Report

Date: 13 October 2026. Test hardware: Linux/Node 22, headless Chromium via Playwright. Physical phones/gamepads are NOT tested.

## Tests executed

| Coverage | Result | Evidence |
|---|---|---|
| `npm test` full Node suite (10 scripts) | PASS | Includes 216 club identities, 12-player rosters, special shots, career, continental cup campaigns, AI difficulty, stats, substitution, morale and new abilities |
| `tests/defensive_abilities.mjs` | PASS | Two field move types, two GK move definitions, stun/dislodge, ball clearance, cooldown, fatigue and resetKickoff preservation, invalid range, unassigned ability, original shot regression |
| `tests/abilities_browser_qa.py` | PASS desktop + emulated landscape phone | Playwright keyboard L and Chromium CDP actual touchscreen Special press; ball dislodging and keeper rescue; no JS exceptions; screenshots saved |
| Previous UI suite `tactics_browser_qa.py` | PASS desktop + mobile | Pre-match/paused tactics, 216 identity badges |
| `kits_browser_qa.py` | PASS desktop + mobile | Two kits, match preview, pause/resume |
| `v060_qa.py`, `manager_v060.py`, `save_filter_v060.py` | PASS desktop + mobile | Championships, manager recruitment/contracts, custom clubs/team filters and saved JSON roundtrip |
| `ai_browser_qa.py`, `stats_browser_qa.py` | PASS desktop + mobile | Difficulty UI and player stats/stamina |
| `fitness_browser_qa.py`, `morale_browser_qa.py` | PASS each in a separate run desktop + mobile | Substitutions/fitness and pre-match/halftime talk/goal emotional UI |
| `fullscreen_brand_qa.py` | PASS desktop + Android landscape | Fullscreen menu/match/fallback, save export and legacy import |

**Execution note:** Combined `npm run qa` timed out after passing 7 of its 9 component UI suites. The remaining **fitness and morale** suites were rerun separately and both passed. Do not treat the combined command as one completed pass. The source includes all tests to reproduce this result.

## Test limitations and unresolved issues

- Full gameplay balancing, extended CPU stress, rare GK technique diversity, field hitbox parity and original-game move frame-by-frame comparison are not yet tested.
- Desktop Chromium and Android emulation alone do not certify real Android touchscreen latency, iOS Safari/PWA fullscreen, Bluetooth controllers, Firefox or GPU performance.
- Hosted app PWA reloading and service-worker caching were not end-to-end tested in this milestone; new ability module is included in cache list, but deployment should be checked after upload.
- Some prior test scripts include dates/version wording from historical test suites. Their assertions target the current release.
