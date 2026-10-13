# Supermagic Football v0.8.9 — validation & regression report

**Test scope:** bounded main-menu UI update, user audit CSV ingestion and backlog; no team/engine modifications.

## Results

- **Source build:** `npm run build` passed, produced complete standalone `play.html`.
- **Node regression:** `npm test` passed **18/18** existing test suites covering teams, AI, player stats, tactics, kits, substitutions, morale, collisions, special attacks, aerial combinations, dribbles, penalty interactions and career/continental competition flows.
- **New UI browser QA:** Chromium desktop 1440×900 and mobile emulation 844×390; 3 dashboard category sections, 14 unique navigation destinations, 5 representative round trips, no page JS exceptions or horizontal scroll. PASS.
- **Full existing browser regression:** see `tests/browser_regression_v089.json` for per-script, per-run status. Initial run: 18/19 passed; the flying-kick UI test failed due to pre-attack collision in its test fixture. Moving the opponent from 42px to 88px, outside the immediate collision zone yet inside the move's 100px hit zone, enabled isolated desktop/mobile tests to pass. The game logic is unchanged. **Final full run: 19/19 PASSED**; see `tests/browser_regression_v089.json` for all individual results.
- **CSV audit:** exact input counts **9,736 / 296 / 806**; produced **734 queued review rows** across seven categories, no roster mutations. `tests/audit_reconciliation.py` runs deterministic count assertions.

## Limits

- The UI screenshots are Chrome/Chromium simulation, not physical Android, iPhone, accessibility switch controls or a physical gamepad.
- Existing scripted game tests are necessary but not sufficient to prove real-world roster accuracy, long-session play balance or historical Nintendo fidelity.
- CSV source URLs and suggested player team memberships **were not freshly independently verified** during this bounded UI release. 2016/2020 BPW years are best-of-era, not official World Cup editions.
