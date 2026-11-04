# Tornado CPU avoidance — 2026-11-02

## Behavior

CPU field players now steer away from the existing live Tornado pull zone after their normal difficulty reaction delay. They keep moving outward until outside the 150-unit radius, using ordinary player movement and stamina handling. Tornado spawn, pull/lift physics, lifetime, controls and save format are unchanged.

## Files

- `src/modules/engine.js` — transient `reactToTornado` movement response and `driveAI` dispatch.
- `tests/tornado_ai_avoidance.test.cjs`
- `tests/tornado_ai_avoidance_browser_qa.py`

## Validation

- `node --test tests/tornado_ai_avoidance.test.cjs` — **3 passed, 0 failed**. Covers both teams and all five difficulty reaction profiles at 30/60/120 Hz, plus keeper/no-hazard/out-of-radius exclusions and the four-action contract.
- `python -X utf8 scripts/build.py` — passed; regenerated the modular browser fixture.
- `python -X utf8 tests/tornado_ai_avoidance_browser_qa.py` — passed on desktop and simulated touch. Both sides leave the live pull radius at all three rates in 0.93 seconds or less while more than 3.5 seconds of tornado lifetime remains; the action pad stays four buttons.
- Physical controller and physical-touch acceptance were not performed.
