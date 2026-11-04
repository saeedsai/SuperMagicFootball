# Ground-trap CPU avoidance — 2026-11-02

## Behavior

CPU field players steer away from armed enemy Banana Peel and Ice hazards. The existing trap radii remain 27 and 35 units. Close-range threats trigger immediate evasion; farther threats follow the CPU's existing difficulty reaction delay. Already airborne players and active slides retain their existing counters. Hazard placement, effects, lifetime, input and save format are unchanged.

## Files

- `src/modules/engine.js` — transient `reactToMagicHazard` selection/avoidance and `driveAI` dispatch.
- `tests/magic_hazard_ai_avoidance.test.cjs`
- `tests/magic_hazard_ai_avoidance_browser_qa.py`

## Validation

- `node --test tests/magic_hazard_ai_avoidance.test.cjs` — **4 passed, 0 failed**. Covers Banana/Ice, both teams, all five CPU profiles, 30/60/120 Hz, timing, unarmed/expired/allied/out-of-range exclusion, and airborne/slide states.
- `python -X utf8 scripts/build.py` — passed; regenerated the modular browser fixture.
- `python -X utf8 tests/magic_hazard_ai_avoidance_browser_qa.py` — passed on desktop and simulated touch. Both trap types and teams clear to the safe edge at 30/60/120 Hz while the hazard remains active; four controls remain visible.
- Physical controller and physical-touch acceptance were not performed.
