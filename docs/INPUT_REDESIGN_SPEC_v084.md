# v0.8.4 — Four-button contextual controls specification

The phone exposes exactly four large buttons in a diamond: **JUMP** top, **PASS** left, **SHOOT** right, **DRIBBLE** bottom. The joystick is only for directional movement. No stand-alone SUPER, SWAP or RUN button is shown. Gamepad A=Shoot, B=Pass, X=Dribble, Y=Jump. Keyboard J/K/I/Space; legacy L/Tab/Shift and optional gamepad LT remain available temporarily during migration.

| Context | Input | Implemented effect | Status |
|---|---|---|---|
| Attack | Tap PASS | Pass on release | Done |
| Attack | Hold PASS >0.24 sec | Longer lofted pass | Done |
| Attack | Hold PASS then tap JUMP | Lofted cross | Done |
| Attack | Hold SHOOT | Charged normal shot on release | Done |
| Attack | JUMP then SHOOT | Aerial shot/header when valid | Partial |
| Attack | Hold JUMP + movement | Faster running | Partial: initial jump still occurs |
| Attack | Double JUMP | Higher second jump (one extra) | Done |
| Attack | Double JUMP + SHOOT while holding ball | Existing transforming Super Shot | Done |
| Attack | DRIBBLE | Short feint | Partial |
| Attack | Double DRIBBLE | Unique trick | Missing |
| Attack | JUMP + DRIBBLE | Bicycle shot | Missing |
| Defense | DRIBBLE | Switch to nearby teammate | Done |
| Defense | SHOOT | Slide tackle | Done |
| Defense | Tap PASS | Normal tackle | Done |
| Defense | Hold PASS | Chase ball | Done |
| Defense | JUMP | Jump / request GK dive | Done |
| Defense | JUMP + SHOOT | Defensive or GK ability, regular tackle fallback | Partial (flying kick missing) |
| Defense | Double JUMP + SHOOT | Bicycle kick | Missing |

Super shots retain in-world effects and sounds, **but do not trigger a center-screen announcement**. Accuracy-driven aim chooses a location further from the live goalkeeper and accuracy scales random dispersion. Automatic switching waits ~0.48 s of persistent large distance difference to prevent accidental switch during active movement/sprint or ball ownership. Further work: player-player collisions, 10 dribble type data and mechanics, manual hotkey remapping, nuanced GK input and animations.

## Architecture and compatibility
- Input state/poll in `src/input.js`, physical buttons in `index.html`, CSS in `style.css`.
- Possession control gating and actions in `GameEngine.updatePlayers()`, `dribble()`, `autoSwitch()` and `shoot()`.
- Baseline saves remain compatible; there is no new persistent save field in this version.
- Tests: `tests/four_button_controls.mjs`, `tests/four_button_browser_qa.py` plus full historical regression suite.
