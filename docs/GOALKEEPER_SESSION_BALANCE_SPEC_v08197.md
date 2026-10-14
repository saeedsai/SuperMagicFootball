# Goalkeeper recovery and extended calibration — v0.8.19.7

## Purpose
Preserve genuine goal-scoring opportunity while distinguishing keepers by ability, fatigue, shot speed and abnormal ball movement. This change affects active match saves, not merely a decorative UI statistic.

## Bounded recovery
After a standard goalkeeper dive, cooldown seconds = `clamp(2.05 + (55-GK Skill)*0.003 + (55-GK Diving)*0.004 + fatigue*0.62, 1.45, 2.85)`.

This time governs when the keeper can perform another normal dive. The rendered dive lasts about 0.64 seconds, followed by a 0.34-second landing state when a keeper does not retain the ball. Catch/throw/punt animations remain independent. Real visual timing should still be reviewed on physical devices.

## Lateral reach cap
The existing skill/diving/speed/shot-level/erratic-trajectory response remains. The new horizontal goal-mouth *lane coverage* is

`min(116 - 22*fatigue, (36 + 0.92*GK Diving + 0.16*GK Skill) * response)` world units.

It applies equally to both goals. It explicitly leaves unguarded corners available even for elite keepers, and tired elite keepers cannot hide fatigue behind a saturated cap. Vertical ball height and forward/backward reach continue to apply.

## Deterministic shot-trial results
These are **save counts out of 55 fixed-lane synthetic shots**, not percentages measured from real played games. Seeded shot configurations varied by skill/diving, fatigue, standard versus very fast shots, and a level-five zigzag super shot. Both directions were tested (1,320 total shots).

| Keeper profile | Ordinary shot | Fast shot | Zigzag Super Shot level 5 |
|---|---:|---:|---:|
| Rookie | 23/55 | 19/55 | 16/55 |
| Mid | 41/55 | 35/55 | 26/55 |
| Elite | 47/55 | 47/55 | 43/55 |
| Elite Tired | 39/55 | 39/55 | 36/55 |

All 4 seeded AI-vs-AI simulation runs completed two halves without NaNs. Their regulation scores were `0-0`, `0-0`, `0-1`, `0-2` (the drawn simulations reached penalty state). Across them, the match engine logged 21 saves, 12 dives, 14 catches, and 9 distributions; this small sample **cannot establish a reliable match-wide save percentage**. Future calibration should run longer, more numerous human/AI matches and assess shot quality distributions.

## Invariants
- Exactly Pass, Shoot, Dribble and Jump are gameplay action buttons.
- Goalkeepers remain autonomous, including for human teams.
- 6 approved formations: 2-1-2, 1-2-2, 2-2-1, 1-3-1, 1-1-3 and 3-1-1.
- GK Diving remains canonical; old `gkJump` import alias is migration-only.
- No guarantee of a save on any shot, and no supernatural teleport to the ball.
