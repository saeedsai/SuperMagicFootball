# v0.7.0 test report

Date: 2026-10-13.

## Verified automated results
1. `npm test` — **PASS**: team badge/flag coverage of 216 teams; tactical invalid-input validation; captain, formation, passing/pressing modifiers, changes while paused; inherited 0.6.3 game stat, career, AI, tournament and 151 continental slot simulations.
2. `npm run qa` — **PASS** in desktop 1440×900 and simulated mobile 844×390 Chromium: command center, team badges, formation, lineup, captain, set-piece roles, attacks, defenses; kickoff with chosen starters; pause then substitute; score/clock persistence in engine tests; saved JSON in mocked storage; existing kits, AI, stats, career, tournament and export flows.
3. Standalone `play.html` built and exercised by Chromium, without external network dependency.
4. Screenshot examples: `tests/command_center_desktop.png`, `tests/command_center_mobile.png`, `tests/tactics_pause_desktop.png`, `tests/kits_setup_desktop.png`.

## Not verified
- Actual file `localStorage` persistence across fresh browser sessions and real disk save-import replay (test environment blocks localhost navigation and `file://`). Browser tests mock storage for same-session assertions.
- Physical phone/USB/Bluetooth controller, low-end GPU frame rates, browsers other than Chromium, commercial/licensing approvals.
- Authentic official club crests/flags, current squad accuracy, canonical FIFA/UEFA roster parity and true original Nintendo mechanics.
- Free-kick/corner gameplay and substitution rules (explicitly backlog).

## Follow-up fixes
A lost GK Jump field on the new squad page was detected by the existing stats browser regression and restored before release.
