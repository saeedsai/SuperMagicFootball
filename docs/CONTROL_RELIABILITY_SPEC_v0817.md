# Four-button control reliability specification — v0.8.17

## Corrected input processing

- The input system buffers key and touchscreen action down/up edges until the next poll, preventing quick taps from being lost between display frames. Previous gamepad polling and Player 2 mapping remain.
- The selected player is snapshotted at the beginning of the player-update loop. Swapping while looping cannot process the same input twice for two field players.
- Press/hold state and release state are tracked independently for Pass and Jump. Tap Pass fires a short pass on release (including fast press+release pairs). Longer holds still produce a high long pass; Jump+Pass still crosses.
- A ball carrier pressing Jump **while steering** delays the ordinary jump until release. If the hold exceeds the sprint threshold, the character runs faster and does not leap on release. A quick release still jumps. A stationary Jump tap retains immediate jump behavior.
- Manual Switch via defensive Dribble or explicit Switch selects another outfield player; 0.85s manual-selection grace avoids immediate auto-switch reversal. Auto-switch is allowed while steering only when another player is substantially closer to the ball after a 0.32s delay. Existing sprint/chase/aerial gating is retained.

## Backlog-only new combinations

- Hold Dribble + Jump → toss ball overhead without player leap.
- Then Jump + Shoot → high-impact non-transforming super bicycle.
- These are **NOT implemented** in v0.8.17. Prioritize state-machine arbitration with existing Jump+Dribble bicycle and defending contexts in a later release.

## Validation contract

- Dedicated Node test checks short/long/rapid Pass, quick Jump vs held Jump, manual switch exactly once, manual grace, automatic switch while steering.
- Desktop and simulated Android Chromium test drives rapid keyboard / CDP touch events before the engine polls and verifies correct action outcome.
- Inherited regressions also cover goalkeeper dive, special shots, aerial combos, four-button dribbles, touch controls, career and tournament setup.
