# Storm lightning CPU avoidance — 2026-11-02

## Behavior

CPU field players now react to an active Storm lightning warning when its strike point is within the existing 110-unit hazard radius. After their normal difficulty reaction delay, they use ordinary movement to move away from the marker and keep doing so until outside the radius. A warning with 0.12 seconds or less remaining does not start a futile response. The existing seeded warning/strike schedule, player effect, four actions and save format remain unchanged.

## Files

- `src/modules/engine.js` — transient warning response in `driveAI`.
- `tests/weather_lightning_ai_avoidance.test.cjs`
- `tests/weather_lightning_ai_avoidance_browser_qa.py`

## Validation

- `node --test tests/weather_lightning_ai_avoidance.test.cjs` — **3 passed, 0 failed**. Covers both teams and 30/60/120 Hz across existing CPU reaction profiles, exclusion cases, and the four-action contract.
- `python -X utf8 scripts/build.py` — passed; regenerated the modular browser fixture.
- `python -X utf8 tests/weather_lightning_ai_avoidance_browser_qa.py` — passed on desktop and simulated touch for both teams at 30/60/120 Hz. The tested Hard profile exits the 110-unit radius with 0.15–0.175 seconds of warning remaining; the visible action pad remains four buttons.
- Physical controller and physical-touch acceptance were not performed.
