# Super Attack Control Contract — v0.8.22.1

**Effective immediately; supersedes the v0.8.21 non-transforming bicycle input specification.** Human gameplay has exactly four action buttons: **Pass, Shoot, Dribble, Jump**. Direction controls are separate. No Special, Sprint, Switch, goalkeeper-dive or fifth human action button.

## Aerial ball within reach
First **Jump** to become airborne near any loose aerial ball (including one created by Hold Dribble → Jump ball lift). Then:

| Button sequence | Result | Ball transformation |
|---|---|---|
| Jump → one Dribble tap | **Normal Bicycle Shot** | Never |
| Jump → **two** Dribble taps | **Super Bicycle Shot** | Same as Super Shot for players with shoot ability |
| Jump → one Shoot tap | **Normal Header** | Never |
| Jump → **two** Shoot taps | **Super Header** | Same as Super Shot for players with shoot ability |

The second tap must occur within **0.32 seconds**. A single tap is committed after that window. The two gestures use the same four actions, and taps are buffered by the existing input queue. A lost ball, loss of reach, stun or timeout cancels pending attacks; neither button can create a shot at long distance. Both attacking directions are supported.

## Carrying the ball

| Button sequence | Result |
|---|---|
| Jump → Shoot, after a **single jump** | **Normal elevated shot**, not Super Shot |
| Jump → second Jump while airborne → Shoot | **Super Shot** if eligible; boosted regular shot otherwise |
| Hold Dribble for at least 0.26 seconds → Jump | **Stationary ball lift** (the player stays on the ground) |
| Following ball lift: release buttons → Jump → double tap Dribble | **Super Bicycle Shot** using the same aerial rule |

### Ability gating and shot identity
- Existing `superAbility.type === 'shoot'` plus a defined shot style grants the Super Shot transformation. A defensive specialist, goalkeeper or player without a shoot specialization **does not** gain that transformation.
- **Super Shot, Super Header and Super Bicycle** use exactly the same `shoot(p,true)` launch calculation: speed, impact/power, shot ID, behavior, color, levels and temporary transformed ball appearance. The *player animation* differs by kick/head/ground delivery; the ball animation is identical.
- An ineligible player who performs one of the super commands fires a **stronger ordinary shot**, with normal ball shape and no transformed-shot metadata.
- Transformed shots revert to normal after the standard 1.65 seconds. The prior legacy untransformed Super Bicycle rule is superseded.
- Super Shot gameplay eligibility is **not yet restricted by Gold/Star/Superstar tier**; those future rules remain inactive pending verified ratings. No player data or tier ratings were changed this release.

### Preserved controls
- Jump **first**, then airborne Pass = cross. Pass first + Jump is not a cross. Hold Pass and release = long/high pass.
- Hold Jump and direction = sprint; off-ball tap Dribble = controlled-player switch. Automatic goalkeeper actions remain unchanged.
- All six approved formations, BPW World Cup teams, and old save IDs are preserved.

### Known limitations
The UI uses desktop keyboard and simulated mobile touch QA, not a hardware-device signoff. The first tap is deliberately delayed to distinguish a single tap from a double tap; actual latency and accessibility on physical touchscreens still require human testing.
