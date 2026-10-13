# Penalty and Controller Mapping Specification — v0.8.8

## Penalty taker

- Movement: directional stick/keyboard and mobile joystick move the ball at 140 world units/sec within X = penalty mark ±86/150 and Y = field goal center ±135.
- DRIBBLE produces a forward feint (28 world units plus small sideways displacement) limited to 3 per attempt. It does not guarantee bypassing the goalkeeper.
- SHOOT executes the shot from the current world ball location. Aiming stays influenced by the taker’s shot-accuracy rating. Existing kick countdown and score/shotout rules are retained.
- CPU takers make bounded forward and lateral approach motions.

## Goalkeeper

- Keeper direction steers along the goal. Press JUMP to initiate a 0.38-second increased lateral dive (0.8-second cooldown); shot and dive remain judged by target-versus-keeper proximity.
- Unlike advanced goalkeeper abilities, this is not a guaranteed supernatural block or fully physical ball collision.

## Controller bindings

- In Settings select Remap Controls. Assign distinct keys and gamepad button indices to Player 1 PASS, SHOOT, DRIBBLE and JUMP; other legacy shortcuts remain for now.
- Duplicate bindings rejected; movement keys WASD reserved; gamepad buttons 0–7 supported. Keyboard controls and Gamepad API remaps tested independently.
- Stored under existing browser storage prefix `legend_controllerBindings`. Included in JSON exported/imported progress; defaults use K/J/I/Space and gamepad B/A/X/Y respectively.
- Existing phone on-screen Pass/Shoot/Dribble/Jump cross is fixed and unchanged. Player 2, contextual alternative assignments and physical gamepad compatibility remain later tasks.
