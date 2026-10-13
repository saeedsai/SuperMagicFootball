# Supermagic Football v0.8.7 — QA and regression report

**Scope:** 13 October 2026, independent HTML5/JS browser game, Node 22 + Chromium headless desktop 1280×720 and emulated Android landscape 844×390.

## Evidence

- **Gameplay:** `npm test` passed **17/17** suites. Older match, stamina, stats, kits, AI, career, continental tournaments, defending/super/GK, tactics, morale, aerial, teammate combination, contact collision and four-button mechanics retained. New `dribble_styles.mjs` tests every profile, 216×12 roster coverage, explicit overrides, identical name identity, fatigue, cooldown, defensive counters and AI usage.
- **New controls:** `dribble_styles_browser_qa.py` passed desktop keyboard and real Chromium simulated Android touch double-taps. No additional touch buttons; cooldown, effect event and active style verified. Screenshots: `tests/dribble_styles_desktop.png`, `tests/dribble_styles_android.png`.
- **Existing browser regressions:** 17 scripts run under a 3-worker batch initially reported 15 pass, 2 failures in timing-sensitive `abilities_browser_qa.py` and `four_button_phase2_browser_qa.py`; both reran **and passed** individually with unchanged assertions. These were not counted as passes on the initial parallel run. See `tests/regression_progress.log` and `tests/RESULTS_BROWSER_v087.log`.
- **Fullscreen/saves:** `fullscreen_brand_qa.py` passed separately on desktop/emulated mobile including legacy save import and unsupported-fullscreen messaging.
- **Build:** `tests/build.py` created standalone HTML; assets and ZIP integrity verified before release.

## Not verified

Actual Android/iOS hardware, physical gamepads (especially Bluetooth latency), performance under long sessions, full accessibility, save continuity across domains, official 2026 squad facts, exact Nintendo physics and commercially licensed artwork. Browser emulation is not hardware certification.

## Known gap

Dribble odds are gameplay estimates, not empirical player data; some per-style visuals are procedural rather than full animation rigs. Tackle/goalkeeper logic and AI still need broader difficulty balancing. Four-button/GK/penalty completion is the **next** bounded milestone.
