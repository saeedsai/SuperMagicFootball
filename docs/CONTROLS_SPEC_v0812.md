# Four-action local controls — v0.8.12

- Both players can bind **Pass, Shoot, Dribble, Jump** to four distinct keyboard keys and four distinct buttons on their respective gamepads. The on-screen phone controller stays fixed to four action buttons.
- Player 1 default: K, J, I, Space; first gamepad B, A, X, Y (indices 1, 0, 2, 3).
- Player 2 default: Period, Comma, Numpad Decimal, Right Ctrl; second gamepad B, A, X, Y.
- `controllerBindings` storage is extended with `keyboard2` and `gamepad2`. Saves containing only `keyboard` and `gamepad` load with Player 2 defaults. Import/export continues with the existing save key.
- Keyboard action keys must be unique within and across players. Reserved steering keys cannot be rebound; gamepad action bindings must be distinct within each controller.
- Solo match: Player 2 cannot receive input from the second gamepad. Two-player versus enables separate pads and keyboard profiles.
- Defending double Jump followed by Shoot while airborne calls the defensive bicycle attack. It consumes bicycle stamina, lasts longer than a normal flying kick, and has extended impact reach. Defender special abilities are attempted first. This remains an original approximation, not a historical frame-accurate move.
- Goalkeeper Jump + Shoot requests an ordinary timed dive when a rare keeper super save cannot be performed. No extra touch button is added.
