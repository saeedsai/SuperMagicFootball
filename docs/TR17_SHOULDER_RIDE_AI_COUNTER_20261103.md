# TR17 Shoulder Ride real-engine CPU counterplay — 3 November 2026

## Acceptance covered

Exercise the real modular `GameEngine.update()` and `driveAI()` paths against an active Shoulder Ride on both attacking directions at 30, 60, and 120 updates per second. Confirm that an opposing CPU breaks the ride before its 0.72-second completion, the ride leaves no stale participant state, the caster still pays the six-second cooldown and 0.035 fatigue, and the existing four-action remapping remains intact.

## Result

`node --test tests/magic_shoulder_ride.test.cjs` passes **5/5**. The new imported-engine regression covers six live simulations (both team directions × three update rates). Every ride ends early through CPU contact or possession loss; the full-engine reaction also applies the ordinary post-contact player state. Cooldown/fatigue remain paid and both participants' `rideBallState` flags are cleared. The test additionally verifies the four remappable actions remain Pass, Shoot, Dribble, and Jump.

No gameplay source change was needed: the existing nearest-defender pursuit and tackle/contact path counters the ride. The original unit cases for legal teammate selection, mirrored travel, cancellation causes, caster cost, and Studio/render hooks continue to pass.

## Scope limits

This is deterministic engine-path coverage, not a human balance or physical-device review. It does not certify every difficulty profile or confirm match-feel acceptance. Existing four-button controls and save data remain unchanged.
