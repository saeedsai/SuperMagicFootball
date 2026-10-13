# Supermagic Football v0.8.17.1 Alpha

Independent HTML5/JavaScript cartoon soccer playable in desktop and mobile browsers; no emulator or NES ROM used.

## Bounded release scope

This is an input reliability/priority hotfix. It combines the previous **Pass, hold-Jump sprint, manual/automatic Switch** corrections with the newer **buffered short-tap/multi-touch** system. It fixes **Jump+Pass crossing in either input order** and **Jump+Dribble bicycle shots getting interrupted by a second Jump**. The phone controller remains exactly four buttons.

## Test and run

- `npm test`: **29 Node suites** covering all prior systems plus combo priority and buffered input.
- `python tests/build.py`: recreate the portable one-file `play.html`.
- `npm run qa`: **19 legacy browser suites**; use smaller sequential batches under execution time limits.
- `python tests/combo_priority_browser_qa.py`: keyboard and simulated Android CDP multi-touch across both chord orders.
- `python tests/rapid_controls_browser_qa.py`: subframe taps, rapid multi-touch.
- `python tests/control_reliability_browser_qa.py`: Pass/switch/sprint behavior.
- `play.html`: single-file offline browser build. `index.html` + `src/` can be served over localhost or HTTPS for installable app features.

## Features intentionally deferred

The new **Hold Dribble+Jump ball pop** and **subsequent untransformed super bicycle** stay in the backlog as #217–218. Authentic 2026 roster coverage, goalkeeper throw polish, iconic player resemblance, BPW eras, World Cup, online multiplayer and special ability expansion remain open.

## Documentation

See `docs/NEXT_MILESTONES.md`, `docs/FEATURE_MATRIX_218_ITEMS.csv`, `docs/GAP_REGISTER_v08171.md`, `docs/CONTROL_COMBO_PRIORITY_SPEC_v08171.md`, `docs/TEST_REPORT_v08171.md` and `docs/CHANGELOG_v08171.md`.
