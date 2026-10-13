# Validation report — v0.8.12

## Checks executed

- **23/23 Node test suites passed** (`npm test`). This includes 22 inherited gameplay suites and the new Player 2/defensive-aerial suite.
- **19/19 inherited browser scripts passed after the one rerun.** The original run of `save_filter_v060.py` failed because the script still expected a v0.8.10 export version. Its assertion was updated to the actual v0.8.12 exported version, and the test passed on desktop and simulated mobile; it was not a game save serialization failure.
- **New browser QA:** `secondary_controls_browser_qa.py` passed on desktop and simulated Android, covering two-player remap UI, save/persistence in the active session, keyboard isolation, bicycle move, and exactly four touch buttons.
- **Additional checks:** character-art, cartoon-identity and fullscreen/branding Chromium QA all passed, as did syntax checks and standalone HTML generation.
- **Source integrity:** game teams and expanded roster databases were not edited; the previous transformations, defensive pursuits, larger field and fatigue logic remain in source.

## Limitations and uncertainty

- Chromium Android simulation is not a physical-device or Bluetooth-gamepad validation.
- Physical multi-controller pairing, Safari PWA behavior, full-season stability and human gameplay balance remain open.
- Browser regression scripts were run individually in bounded batches. This is not a claim of one uninterrupted long run.
- Legacy test expectations for public build versions needed updating. Original 19-batch status file had 1 temporary failure(s), all addressed with an actual rerun.

See `tests/v0812_regression/` for detailed browser results and `tests/v0812_node.log` for game-logic test output.
