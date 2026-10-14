# v0.8.24.8 — Shot flight and ground-contact corrections

## Confirmed engine issues

1. **Frame-dependent resting-ball friction:** `updateBall()` previously applied an impact-specific horizontal velocity reduction on every repeated ground contact. At high update rates a motionless-on-ground ball fell a tiny distance under gravity every alternate frame, incorrectly multiplying its friction. A resting ball no longer incurs a new bounce penalty. Actual airborne landings still bounce and lose energy; ordinary rolling drag uses the existing time-scaled calculation.
2. **Ordinary shot reach:** normal goal-directed shots previously lost enough momentum that medium-range shots frequently could not reach a goal even with the goalkeeper away from the lane. A bounded 1.8-second ordinary-shot flight profile now applies gentler drag. Passes, goalkeeper distributions, and super-shot transformations remain distinct. A successful tackle/save/collection cannot inherit this profile.

## Exact implementation

- `src/engine.js`: `freeBall()` adds `ordinaryShot` only to the normal Shoot action; `take()`, headers and keeper deflections clear the flag. A 1.8-second window uses rolling coefficient 0.996 on standard grass (0.994 wet, 0.992 sand) for flagged shots with `power > 5`; otherwise original surface-based drag applies.
- `updateBall()` handles `z <= 0` with a previous-airborne check; this avoids phantom repeated ground-impact losses when the ball is resting.
- No player abilities, keeper radii, jump combinations, Super Shot speed, four-button bindings, team IDs, roster or saved preferences were changed.

## Acceptance and validation

- `tests/v08248_ordinary_shot_range.mjs`: 500 deterministic controlled engine fixtures (380 normal shots, 120 passes) over mirrored attack directions, five selected CPU levels and 30/60/120 Hz integration; direct resting-ball rolling velocity tests at all three time steps.
- Other Node gameplay regressions and headless Chromium UI/play regressions must pass.
- A goalkeeper deliberately positioned outside the shot lane isolates ball flight. It is **not** a full physical CPU-vs-human test; no win-rate or goalkeeper-balance improvement is claimed on this evidence.
- See `CPU_SHOT_RANGE_CALIBRATION_v08248.json` for measured outcomes.

## Next calibration work

Drive a reproducible **human-vs-CPU** match fixture with representative defensive involvement, evaluate aim, saves, goals, interceptions, and late-game fatigue across varied teams, then tune only if confidence intervals and replay evidence justify it. Validate real hardware and visual/ball-speed perception.
