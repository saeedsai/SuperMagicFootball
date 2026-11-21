# Ground-trap CPU avoidance and sweep counterplay — 2026-11-21

## Behavior

CPU field players steer away from armed enemy Banana Peel and Ice hazards using the existing difficulty reaction delay. A grounded defender may instead use the existing SHOOT slide when the trap is directly in its running lane and the sweep is safe: the defender must not be carrying the ball, an opponent must not be in the slide's forward arc, and a teammate must not already be sweeping the same trap. The normal tackle cooldown/stamina and the production hazard-disarm phase remain authoritative. Unsafe, unavailable, airborne, allied, unarmed, expired and distant cases retain their previous behavior.

The existing trap radii remain 27 and 35 units. Hazard placement, effects, lifetime, four-button input grammar and save format are unchanged.

## Files

- `src/modules/engine.js` — transient `reactToMagicHazard` decision and `driveAI` dispatch.
- `src/modules/magic-hazards.js` — existing production slide-disarm resolver (unchanged).
- `tests/magic_hazard_ai_avoidance.test.cjs`
- `tests/magic_hazard_ai_avoidance_browser_qa.py`

## Validation

- Focused Node regression covers Banana/Ice, both teams, all five CPU profiles, 30/60/120 Hz, reaction timing, allied/unarmed/expired/out-of-range exclusion, airborne/slide states, safe SHOOT sweep, actual disarming, and unsafe fallback.
- The browser acceptance must call `reactToMagicHazard` and then the real `updateMagicHazards` post-movement phase each frame. This is required to observe a slide disarming the trap; calling only the decision method leaves the slide in progress and does not run the production resolver.
- Desktop and simulated-touch browser acceptance checks either a safe escape or an actual `magicHazardDisarmed` event for both trap types and teams at 30/60/120 Hz, while preserving exactly four action buttons.
- Exact-head CI for the current candidate remains pending; no physical-device acceptance is claimed.
