# v0.8.15 Gameplay Specification — Active AI, GK Distribution, Grounded Super Shots

## AI defensive assignment

`defensivePressers(players, defendingTeam, ballOrCarrier, humanControlled)` selects the nearest **eligible non-GK AI player** as primary, and a second eligible player as cover. The human-controlled player is not eligible for AI assignments.

The primary follows the live ball / carrier at every frame while the defending side lacks the ball. At close range it **attempts** a regular or sliding tackle. Successful recovery is still probabilistic and governed by existing defense/aggression/strength, stamina and cooldowns. The second moves into offset defensive support. This preserves all five CPU difficulty profiles.

## Keeper distribution and context

With goalkeeper possession:

- **Pass** = short toward the nearest on-field, not-stunned teammate.
- **Shoot** = long punt toward the most advanced available teammate (or a safe forward lane if none exists).
- **CPU auto** = nearest when safe and within range; punt if pressured or no short teammate is near.

`keeperDistribution` events include short/long `mode` and target player name. Saves retain the existing schema.

## Super-shot descending rule

- Standard ground shots retain their previous launch profile.
- Standard jump-initiated transformed shots clamp their ball launch height into the reachable goal-mouth window and launch downward.
- Special teammate apex kicks similarly clamp height and launch downward.
- The shot's transformation behavior, color and movement profile remain stored in `ball.shot` while its existing short animation window runs.
- Ordinary non-super flip kicks remain lofted. This is a specific gameplay correction, not a rewrite of historical shot behavior.

## Follow-up: 5 ability levels

Deferred to a separate release, not implemented here: both `superShotLevel` and `superDefenceLevel` from 1 to 5, increasing power and modestly lowering action-fatigue costs, with extremely rare level-4 stars and level-5 superstars. Levels must remain distinct from XP/general overall rating and must not grant the ability to players with no special assigned.
