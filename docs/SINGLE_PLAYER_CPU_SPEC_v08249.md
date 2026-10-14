# v0.8.24.9 — Control ownership and CPU calibration specification

## Corrected defect

Prior to this iteration `GameEngine.inControl(t)` treated home team 0 as user-controlled regardless of `humans`, and `updatePlayers` assigned player 3 the input role in `humans=0`. Thus match telemetry from supposed fully autonomous AI-vs-AI games was contaminated by a stationary, human-controlled home teammate. The control model is now:

| Human players | Home human control | Away human control | Keeper / NPC AI |
|---|---|---|---|
| 0 | None | None | Both sides autonomous at Normal AI difficulty |
| 1 | Home | None | Away CPU uses selected difficulty |
| 2 | Home | Away | Remaining NPCs use Normal baseline |

Automatic control switching and penalty controls obey the same ownership. This does not create a new gameplay action or change the actual supported quick-match input routes.

## Test methodology

- `tests/v08249_zero_human_control.mjs`: verifies control ownership for 0,1,2 users, the autonomous home attacker, and invariant AI-vs-AI Normal difficulty.
- `tests/v08249_single_player_calibration.mjs`: tests 120 scripted regular attacks (5 difficulty presets × 3 home/away team pairings × 2 distances × 4 seeds) with a human-owned home shooter, real active opposing goalkeeper and AI defensive cover. Runs actual full engine update, retains ball/player finite checks, and records scored goals, save events and movement reactions.
- Results in `SINGLE_PLAYER_CPU_CALIBRATION_v08249.json`. Statistics are **diagnostic**, not passing thresholds for win rate or CPU skill balance.

## Limitations and future work

Scripted shot invocation bypasses real human reaction, build-up, dribbling, tactics and pass selection; 24 attempts per difficulty is too sparse and goalie save events overlap defensive outcomes. Next use a deterministic action-input controller for complete human-versus-CPU matches, collect more seeds and distinct attacking qualities, analyze results with uncertainty, and retune only when a defect is supported.
