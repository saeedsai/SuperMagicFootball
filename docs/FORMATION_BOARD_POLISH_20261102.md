# Formation board visual polish — 2 November 2026

## Change

Improved the Team Command Center mini-pitch with higher-contrast turf bands, halfway and center-circle markings, a clearer inset touchline, larger layered portrait frames, readable name/OVR plates and role colors for goalkeeper, defense, midfield and forward. Each portrait has an accessible role name. The 12-player roster list now uses more of the available viewport and remains its own touch-scrollable region. The six existing `FORMATIONS` maps remain the sole source of player coordinates; these are presentation-only changes and do not alter lineup behavior, tactics or saves.

## Validation

- `node --test tests/lineup_role_fit.test.cjs`: **3/3 passed**.
- `python -X utf8 scripts/build.py`: passed; regenerated `tests/.generated/play.html` from modular runtime.
- `python -X utf8 tests/v08193_ui_browser_qa.py`: passed in 1400×850 desktop and 390×844 simulated-touch Chromium. All six formations displayed six portraits with matching role cues; every marker remained within the mini-pitch; face canvases contained rendered pixels; all 12 roster cards remained available in an independently scrollable area; no browser errors.
- Reviewed desktop and simulated-mobile screenshots at `evidence/browser/formation_quality_desktop.png`, `evidence/browser/formation_quality_mobile.png`, `evidence/browser/command_center_quality_desktop.png` and `evidence/browser/command_center_quality_mobile.png`.

## Limits

The screenshots establish browser rendering at the tested desktop and simulated-mobile viewports only. Physical-device fit, assistive-technology review, and owner visual acceptance remain open under VIZ-05. This increment does not complete the broader UI, customization or animation backlog.
