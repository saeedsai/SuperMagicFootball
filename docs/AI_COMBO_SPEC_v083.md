# AI-coordinated team combinations — v0.8.3

## Bounded scope

Independent arcade-game extension. AI now initiates the **same** v0.8.2 teammate launch and `tryFlipKick` move as a human: no invisible assists, telekinetic shot or free stamina. The original human combo and exceptional goalkeeper abilities remain unchanged.

## Decisions

1. A loose ball between **80 and 380 game-world altitude units** is eligible. The CPU predicts its short-term x/y/z position using ball velocity and gravity.
2. A grounded field jumper must have sufficient stamina, be off combo cooldown, and be near the predicted ball. The partner must be an available, grounded, non-stunned teammate within **210** units.
3. If the helper is outside **108** units, give it a short-lived support-run target (1.4 s), then reassess. If within launch distance, invoke the existing 115-unit `tryTeammateLaunch` check, which charges stamina to both and emits `teamLaunch`.
4. After launch, CPU tracks the ball while airborne. At valid apex height (>=145), with vertical speed in the difficulty-dependent timing band, invoke `tryFlipKick(..., true)`; otherwise attempt a normal flip kick late in descent.
5. At most one automated team combo every **5.3 game seconds**. Re-evaluation respects AI reaction time; Rookie does not auto-coordinate. A manually controlled player is never auto-launched.

### Difficulty parameters (0 to 1)

| Difficulty | Combo awareness | Timing fraction |
|---|---:|---:|
| Rookie | 0 | 0 |
| Easy | .25 | .35 |
| Normal | .55 | .60 |
| Hard | .82 | .82 |
| Expert | 1 | 1 |

## Input interaction defect fixed

A held PASS press could leave a queued ground-chase action. In an assisted jump, that chase sometimes auto-triggered a tackle before the SPECIAL event and consumed the user's action. v0.8.3 clears chase at launch and blocks ground-only chase processing while airborne. Dedicated Node and repeated Chromium keyboard/touch regressions now cover this.

## Historical fidelity constraints

1993 original frame timings, original air-stack animations, individual move animations, dives/ball riding, face artwork and 1993 AI behavior have **not** been demonstrated equivalent. This is an independent new AI behavior for Supermagic Football. Gameplay references should be captured/annotated before marking Classic parity complete.
