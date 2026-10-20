# FIX-UI-101 — consistent Back navigation (20 October 2026)

## Shipped scope

- `src/modules/ui.js`: `page()` now records its visible Back destination in `menuBackAction` so Escape, Backspace, and gamepad menu Back match the on-screen control.
- Team Command Center keeps setup/pause destinations as higher-priority routes while preserving the actual customization/entry-menu parent.
- Controller Mapping now returns to **Input Settings**, rather than skipping it to Settings.
- The older `tests/halftime_tactics_return.test.cjs` assertion was updated to retain required halftime/pause/setup behavior while accepting a dynamic non-match entry origin. No test was removed or skipped.
- `tests/ui_back_routes_20261020.test.cjs` covers six focused scenarios using the actual UI navigation function blocks and both visible/keyboard destinations.
- `tests/ui_back_routes_browser_qa.py` exercises the actual game fixture with real Chromium desktop and simulated-touch contexts: five customization routes, controller mapping and Backspace/Escape. The full regression runner automatically discovers this `browser_qa.py`.

## Exclusions and invariants

No gameplay movement, goalkeeper logic, four-button control mapping, team/player roster IDs, save schema, graphics, or release/version logic changed. Existing About GitHub dev SHA, latest commit and release notes behavior remains intact until the coordinated four-part `0.9.0.0` migration is approved and certified.

## Tests and acceptance

- Source change: `14d7b6c3c749ab6390366ad64fd9e2085c39debd`.
- Focused Node test: `tests/ui_back_routes_20261020.test.cjs`. Paired compatibility: `tests/halftime_tactics_return.test.cjs`.
- Desktop and simulated-touch real-game browser script: `tests/ui_back_routes_browser_qa.py`.
- Modular QA first green with both source and Node test at `3847c6642622df5c9a10daf24be1b1f836acb664` after updating a stale legacy assertion.
- **Full eight-shard integrated SHA and Pages are not certified by this document; confirm GitHub Actions before claiming release.** A successful green commit may be automatically promoted by `.github/workflows/full-regression-census.yml`.

## Handover

Complete this bounded Back-route fix first; then re-claim `ui-controls` for `FIX-UI-102` home version banner removal, followed by 10 Career/Cups slots and Player Studio enhancements. Never make UI changes under another active claim; retain internal About traceability until coordinated version migration.
