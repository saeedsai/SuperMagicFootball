# Supernova CPU counterplay — 2026-11-02

## Behavior

The CPU now recognizes an opposing Supernova warning when a non-keeper defender is within its existing 142-unit radius. It uses the selected difficulty's reaction delay and the existing Jump action to reach the current airborne counter. A defender already airborne or sliding is left alone; an expired warning or a warning with at most 0.12 seconds remaining cannot trigger a late, ineffective jump. The Supernova's 0.85-second warning, radius, effect, controls and save schema are unchanged.

## Files

- `src/modules/engine.js` — transient `reactToSupernova` logic and `driveAI` call.
- `tests/supernova_ai_counter.test.cjs`
- `tests/supernova_ai_counter_browser_qa.py`

## Validation

- `node --test tests/supernova_ai_counter.test.cjs` — **3 passed, 0 failed**. Covers both teams, all five existing difficulty profiles, 30/60/120 Hz, warning expiry, ally/out-of-radius exclusion and pre-existing counter states.
- `python -X utf8 scripts/build.py` — passed; regenerated the modular browser fixture.
- `python -X utf8 tests/supernova_ai_counter_browser_qa.py` — passed on desktop and simulated touch, both sides and 30/60/120 Hz. At the Hard profile the CPU starts with about 0.317 seconds remaining and reaches z≥20 before impact; the visible action pad remains four buttons.
- Physical controller, physical touch and owner visual review were not performed.
