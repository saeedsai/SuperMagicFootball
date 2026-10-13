# v0.8.8 — Regression and validation report

## Game-logic tests

**18/18 Node suites passed**, including new `penalty_controls.mjs`: position changes, dribble limits, timed keeper dive, shot origin, competitive shootout state, invalid duplicate mappings, remapped keyboard and Gamepad API polling.

## Desktop and simulated Android Chromium

- **17 existing browser QA scripts passed** (including one version-assertion update to 0.8.8). 16 passed on their first isolated/batch attempts; `four_button_phase2_browser_qa.py` initially failed a timing-sensitive defensive flying-kick assertion under combined load and passed on standalone rerun on both desktop and simulated Android. The result is treated as flaky, not an undisputed clean first pass.
- New `penalty_controls_browser_qa.py` passed on desktop and simulated Android: Settings mapping UI, live keyboard/joystick penalty movement, shooting from the moved position, four on-screen action buttons, no page errors.
- Additional `fullscreen_brand_qa.py` passed desktop and mobile-landscape fullscreen/fallback, save export and legacy import.
- Existing save-filter QA initially failed because it expected the previous version string; after updating the assertion it passed on desktop and simulated mobile. Version expectation only changed; gameplay assertions retained.
- Portable HTML built via tests/build.py, JavaScript syntax checked, ZIP package integrity checked.

## Known limitations / not validated

- A real Android/iOS physical phone and USB/Bluetooth physical gamepad were not tested. The tests are Chromium simulations.
- Host HTTPS installation, long-term save persistence across origin changes, framerate on low-end phones and network play were not tested.
- Penalties remain simplified (bounded ball motion, no full in-box defender collision, GK spatial outcome threshold), and no new goal/field referee rules were added.
- Player 2 mapping and some four-button defensive double-jump combinations remain unfinished.
