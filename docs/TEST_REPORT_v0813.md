# Supermagic Football v0.8.13 — Test and Validation Report

**Scope:** 216-team roster normalization (2 GK / 3 DF / 4 MF / 3 FW), star-first six-player match squads, role corrections from the user audit, packaged HTML and save compatibility.

## Test results

- `npm test`: **24/24 Node suites passed** on the final updated roster code, including all 23 inherited suites and `roster_reconciliation.mjs`.
- New `tests/roster_reconciliation.mjs`: all **216** teams have **exactly 12** records, **unique names and IDs within each team**, and position counts GK2/DF3/MF4/FW3. First-choice keeper and **GK/DF/DF/MF/FW/FW starting formation** validation, team-plan safety, 0–100 player stat generation, retained named stars, game setup with changed clubs, paused tactical changes, all passed.
- New `tests/roster_browser_qa.py`: **desktop and simulated Android PASS**, club roster validation for AC Milan, Arsenal, Barcelona and Real Madrid, manager command center, match kickoff, and no JavaScript page errors.
- Inherited `npm run qa` was stopped by an execution-time cap *after 7 scripts* (tactics, kits, continental, manager, save filtering, AI difficulty, player-stat screens). All 7 completed passes; the 12 remaining scripts were then run separately in batches and **all 12 passed**:
  1. Fitness, morale, defensive ability;
  2. Aerial actions, teammate combo, AI combo;
  3. Four-button controls, physical collisions, four-button phase 2;
  4. Ten dribble styles, penalty interactions, home dashboard.
- Extra desktop/simulated-mobile scripts: **Player 2 controls, cartoon identities, character art, and fullscreen/brand/legacy-save tests all passed**.
- After updating the save-export version to `0.8.13`, the save-export/browser test was rerun on desktop/mobile and **passed**. The offline game was rebuilt from `src/` after this change.

## Important data validation limitations

- **Roster balance is validated; worldwide club membership is NOT.** 1776 slots are fictional placeholders; other named players include editorial transfers that still need independent verification.
- The user audit file contains some incorrectly attributed position links. Role corrections rely on cross-checking obvious football roles and a small number of official 2026–27 squad references, not complete historical roster sign-off.
- Many ratings/value fields are synthetic gameplay estimates. Real player ages, physical appearance, value and 2026/27 squad identity are not comprehensively validated.
- The game uses six active on-field players per team; the **12-player** quota includes 6 substitutes/reserves. Club-creator user edits remain intentionally preserved, and may override default roster updates.
- Physical Android/iPhone devices, Bluetooth gamepads, Firefox, Safari, very long career campaigns, accessibility and licensed official rosters have not been validated.

## Release acceptance

The narrowly defined v0.8.13 **roster structure + priority shortlist acceptance passes**. Complete 2026 real-world squad authenticity and full Transfermarkt/EA rating alignment remain **open**, and must not be described as solved.
