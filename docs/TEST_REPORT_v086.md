# Validation report — v0.8.6

**Date:** 2026-10-13 · Browser baseline: Chromium (headless desktop and simulated Android). **Not a physical phone test.**

## Results

- **Node:** 16/16 suites passed via `npm test` including new `four_button_phase2.mjs`. Existing match simulation, kits, AI, career, continental leagues, tactics, special abilities, morale, fatigue, aerial combinations, input and collisions retained.
- **New browser QA:** `four_button_phase2_browser_qa.py` passed on desktop and simulated Android with actual keyboard and multi-touch input (bicycle and flying kick), plus keeper distribution.
- **Existing browser regression suite:** all 15 scripts passed when run separately/in bounded batches, including tactical control, kits, championships, manager career, save roundtrip, difficulty, stats, stamina, morale, special abilities, aerial mechanics, combos, AI coordination, four-button controls and collisions. Fullscreen/branding QA also passed.
- **Issue found and corrected:** export schema reported v0.8.5 instead of v0.8.6. Save roundtrip passed after correcting it.
- **Intermittent test isolation:** mobile GK dive failed when tested after hyperdash/heading with intervening player collisions. Standalone Android touch test confirmed GK dive works. Existing aerial regression passed after separating nonparticipating players and allowing a fair reaction window.
- **Build:** `npm run build` generated standalone offline `play.html`; code syntax and ZIP contents checked.

## Coverage boundaries

- Not tested on physical iOS/Android phones or physical gamepads.
- Game balancing, 60-FPS load, full-match human playtest, cross-origin browser storage and real network multiplayer not validated.
- Success in synthetic game-state tests does not establish full original 1993 Nintendo gameplay parity.
