# Goalkeeper intelligence, GK Diving and animation — v0.8.19.6

## Canonical attribute rename

**GK Diving** replaces **GK Jump** everywhere in the current UI, roster stats, Career role calculations, canonical CSV columns, OVR inputs and gameplay references. Canonical JavaScript/JSON field: `gkDiving` (range 1–100). The deprecated `gkJump` key is accepted **only on legacy JSON/roster import**, normalized by `withStats`, and removed from hydrated player records; where both fields exist the new field wins. This avoids breaking old saved data. No new goalkeeper action button has been introduced.

## Nonlinear shot anticipation

`predictKeeperShot(keeper, ball, horizon)` estimates the ball's near-future crossing point at the goalkeeper's x-plane. Uses bounded 1/90-second steps to replay the existing `updateBall` curve, zigzag, swim, spiral, ricochet, homing, clone, burrow, warp and lightning y-accelerations, plus vertical gravity and pitch-sidewall bounces. It never mutates the live ball or shot metadata and stops after 0.95 seconds. A missing crossing or ball moving away has no projection.

`predictedKeeperLane` blends the actual visible lane with the predicted lane using GK Skill and GK Diving; fatigue, shot level and erratic shot styles reduce prediction trust. The target is clamped inside the normal keeper lane: prediction is *not teleportation*. The goalkeeper must move physically and be within `keeperReactionReach` at contact. Both mirrored goal directions are supported.

## Save eligibility and balance

`keeperReactionReach` remains deterministic and skill dependent. The baseline range is restricted by GK Skill, GK Diving, fatigue, shot velocity and Super Shot level, with an additional small reaction penalty for unpredictable trajectories. There is no fabricated real-world save percentage. Catches and parries remain chosen based on existing save quality versus incoming force; opposing players can score through reachable gaps. Low shots that cross the keeper's plane between frames use swept collision detection; wide, high and away-moving shots do not generate impossible diving saves.

A 61-lane synthetic reach-grid check from the prior release remains green. It describes geometry only, not actual gameplay save rate. Whole-match save percentages per goalkeeper and Super Shot must be calibrated by seeded long-match simulations and human playtesting; that is still a P0 follow-up.

## Directional animations

A dive records `diveDy`, `diveDx` and `diveElapsed`. Drawing now uses the actual movement direction, interpolation, outstretched-glove indicators and motion trails, replacing the previous fixed ring. A diving catch uses `keeperDiveCatch` while retaining ball possession and the normal distribution logic; a standing catch still uses `keeperCatch`. Both teams defend automatically. The four gameplay buttons remain Pass/Shoot/Dribble/Jump.

## Evidence and limitations

`tests/v08196_keeper_prediction.mjs` covers field migration, deterministic curved/zigzag/homing/spiral/warp prediction, non-mutation, mirrored goals, skill-dependent anticipation, moving-away cases, nonlinear save penalties, and directional catch animation. `tests/v08196_keeper_browser_qa.py` checks live standalone HTML on desktop and simulated Android, label migration, automatic dive catches and button count. Existing v0.8.19.4 swept keeper, v0.8.19.2 anticipation, v0.8.19 catching/punting and OVR regressions all pass. Physical phone, controller, non-Chromium, real match save-rate balancing and artistic sprite review are NOT verified.
