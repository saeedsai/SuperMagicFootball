# Reduced-motion weather cue — 3 November 2026

## Change

`drawWeather` now uses a fixed visual time when the existing reduced-flash/reduced-motion preference is active. Rain and wind streaks, ground ripples, and lightning animation no longer move or pulse across frames in that mode. The warning ring remains fully visible and steady while the engine's warning/strike timers continue normally. Standard weather rendering is unchanged.

## Validation

- Focused `weather_02_events` Node suite: **5/5 passed**.
- Modular build: passed.
- Actual Canvas Chromium gallery: **10 scenarios passed**, no page errors. Rain and Wind pixel signatures move over time normally and remain pixel-identical, visible, and static with reduced motion. Lightning warning/strike cues animate normally and remain steady with reduced motion. Field clipping, existing stroke budgets, and 30/60/120 Hz lightning/tornado checks pass.
- The focused browser fixture now waits for navigation `commit`, then explicitly waits for the game renderer API before making assertions; this avoids treating unrelated late page-load completion as an app-ready signal.

## Limits

No weather timing, event schedule, physics, or save behavior changed. This is not physical-device or owner visual acceptance. The broader candidate browser census still has separate local page-load timeouts; see the [candidate browser-load report](qa_runs_012620_final_20261103/README.md).
