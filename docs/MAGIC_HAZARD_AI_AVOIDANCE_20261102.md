# Ground-trap CPU avoidance and counterplay — updated 2026-11-24

## Behavior

CPU field players steer away from armed enemy Banana Peel and Ice hazards using the existing difficulty reaction delay. A grounded defender may first use the existing SHOOT slide when the trap is directly in its running lane and the sweep is safe: the defender must not be carrying the ball, an opponent must not be in the slide's forward arc, and a teammate must not already be sweeping the same trap.

When a trap is immediately in the player's path and a safe SHOOT-slide sweep is unavailable, the CPU uses the existing JUMP action as a last-moment counter. The live first frame of `jump` or `doubleJump` counts as airborne while its action timer and jump count are active, even before vertical lift reaches 20. The CPU continues moving away while airborne until it is clear. A carrier retains possession through the hop.

When several armed enemy traps are visible, an already-overlapping trap is handled first; otherwise the AI prioritizes a trap intersecting its current travel corridor (the same ahead/across test used by slide/JUMP decisions) over a nearer off-lane trap. If no trap intersects the lane, nearest-distance fallback remains unchanged. This prevents steering away from an off-lane trap into a second trap directly ahead.

The normal tackle cooldown/stamina and production hazard-disarm phase remain authoritative. Safe slide disarms retain priority. Allied, unarmed, expired and distant traps are not countered; an expired/non-jump action does not receive first-frame immunity. The existing trap radii remain 27 and 35 units. Hazard placement, effects, lifetime, four-button input grammar and save format are unchanged.

## Files

- `src/modules/engine.js` — transient `reactToMagicHazard` decision, safe slide priority, JUMP fallback and airborne escape continuation.
- `src/modules/magic-hazards.js` — shared first-frame JUMP collision predicate plus the existing production slide-disarm resolver.
- `tests/magic_hazard_ai_avoidance.test.cjs`
- `tests/magic_hazard_ai_avoidance_browser_qa.py`

## Validation

- Focused Node regression covers Banana/Ice, both teams, all five CPU profiles, 30/60/120 Hz, reaction timing, allied/unarmed/expired/out-of-range exclusion, airborne/slide states, safe SHOOT sweep, actual disarming, unsafe JUMP fallback, carrier possession retention, active-versus-expired first-frame JUMP, and selection of a farther in-lane trap over a nearer off-lane trap.
- The browser acceptance calls `reactToMagicHazard` and then the real `updateMagicHazards` post-movement phase. This is required to observe the production resolver rather than only a decision flag.
- Desktop and simulated-touch browser acceptance checks safe slide disarm and CPU JUMP evasion for both trap types and teams at 30/60/120 Hz, competing off-lane/in-lane traps for both teams, exactly four action buttons and possession through the hop.
- Exact-head .245 CI initially exposed a test-fixture `ReferenceError` (`carrier`/`field` were not defined); the fixture now creates its own bounded field and trap owner. The rerun at the new exact head is pending. No physical-device acceptance is claimed.
