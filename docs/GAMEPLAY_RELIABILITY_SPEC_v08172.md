# Gameplay Reliability and Accuracy — v0.8.17.2

## FIX-001 Pass: edge recovery
`Input.poll()` now preserves `released` actions even when a keyboard/touch press+release happens before a rendered frame. `GameEngine.updatePlayers()` consumes this edge immediately for an ordinary Pass rather than waiting for another poll. A tap cannot trigger a duplicate action on the next frame. Longer holds continue to produce higher aerial passes; Pass+Jump still produces a single cross. Multiple held pointers on one touch action are released only when its last pointer leaves. Pause/focus-blur clears pending actions.

**Residual risk:** if multiple complete press cycles occur entirely between two polls, the current Set-based input buffer coalesces them into one edge. High-refresh and very low-frame-rate field acceptance testing is required. The defensive no-possession Pass remains a tackle/chase action by design.

## FIX-002 Jump: defensive tap + ball carrier hold
A short Jump press-release while controlling an out-of-possession field player now queues and executes a jump rather than silently treating the tap only as defensive sprint. The ball carrier continues to defer Jump to release so a sustained Jump + movement accelerates without unwanted jumping. Existing Pass+Jump cross, Jump+Dribble bicycle, airborne double jump and goalkeeper dive priorities remain. Short taps at <= roughly 180 ms trigger the ordinary jump, subject to stun/airborne eligibility.

**Residual risk:** all gestures must be rechecked with actual multitouch hardware, gamepads and low-FPS timing. Long Jump remains a defensive speed control, as specified previously.

## FIX-003 Shot selection and Accuracy
For regular ground/air shots and special-shot launch aim: enumerate seven points inside the mouth (margin 33 world units), prioritize distance from keeper and avoid obstacles close to the projected lane. `shootAccuracy` controls both the chance of recognizing the best candidate and the execution dispersion. Low accuracy has an extra chance to overshoot the posts; the target can lie outside `[goalTop,goalBottom]`. Preserve opponent diving, on-field blockers, shot physics, wind, special-shot trajectory behaviors and goalkeeper saves; accuracy must never guarantee a goal. The intended shot endpoint is exposed as `ball.targetY` for regression inspection; special homing/curve may change its actual trajectory.

**Scope limitation:** horizontal goal geometry remains a 2D projected mouth with a separate ball-height test, so this is not a physical 3D corner-selection simulation; manual vertical input slightly biases poor-accuracy aim. More keeper-prediction and shot elevation work remains.

## FIX-004 Victim-Strength dependent tackle stun
A successful `GameEngine.tackle` applies `tackleStunDuration(victim.strength, slide, contest.duration)` to the *victim*. Duration is clamped to 0.22–1.05 seconds, reducing as victim Strength rises. Hurt action timer lasts through the stun. Invulnerability prevents repeated stuns from a continuous hit; missed or invulnerable tackle does not stun. `tackleHit` event records successful hits. The previously implemented physical body-contact stun and defensive supernatural effects are separate and retained.

## QA acceptance / limitations
Node: 30/30 scripted suites including a new statistical shot/tackle suite; fixed PRNG, both shooting sides, keeper top/middle/bottom, three accuracy bands, blocker lanes, hit/miss recovery. Portable browser: focused real-keyboard and Chromium CDP simulated Android touch tests. **Physical** Android/iOS/gamepad verification is pending. Full historical chained 19-script browser suite timed out; all 19 scripts passed individually (two simulated touch failures were flaky on initial executions); individual reruns are listed in `TEST_REPORT_v08172.md`.
