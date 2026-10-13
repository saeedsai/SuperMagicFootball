# Supermagic Football v0.8.17 — Validation and regression report

**Focus:** Pass, hold-Jump sprint with the ball, defensive manual Switch, and automatic player selection. New ball-lift/super-bicycle combinations are tracked but not implemented.

## Results

- **27/27 Node suites PASS**: 26 inherited suites plus `tests/control_reliability.mjs`.
- **19/19 inherited Chromium browser scripts PASS** in smaller sequential batches after the combined parallel runner timed out.
- **8/8 additional Chromium browser scripts PASS**, including the new control-reliability suite, Player 2 remapping, roster, character art, cartoon flags, fullscreen, five-level specials and active pressing.
- Desktop and simulated Android tested for **very fast Pass press/release**; Node tests additionally cover ultra-fast Shoot and Jump taps, single defensive Switch action, automatic switch while joystick steering, held Jump sprint with possession and exactly four on-screen action buttons.
- Offline single-file build regenerated after source updates. The five affected browser suites were rerun following the final rapid-Shoot/Jump correction and passed.

## Root causes and fixes

1. Very quick keys/touch button taps could start/end between engine polling frames, leaving no Pass event. Added queued down/up edges; short release Pass remains responsive. Very fast Shoot taps and moving Jump taps now also resolve exactly once.
2. Hold Jump with ball immediately jumped when the player started moving. Separated moving tap-Jump from sustained hold-to-run gesture.
3. Manual Switch could be handled again by a second teammate later in the same `updatePlayers` loop. Snapshot selected players once per frame.
4. Auto-switch unconditionally aborted while the movement joystick was active. It now compares distance with hysteresis/delay and honors manual switch grace.

## Test limitations

- A combined parallel browser process exceeded the execution window before reporting results; all 19 legacy scripts were subsequently run separately in batches and passed.
- Actual Android/iPhone devices, Bluetooth/USB controllers, Safari/Firefox and very long gameplay sessions are not verified by Chromium simulation.
- Tests do not establish fully original-Nintendo gameplay parity, complete current rosters or final supershot catalogs.

## Release acceptance

All four reported control faults have regression coverage and pass in the packaged standalone HTML. The two requested new combinations remain unimplemented backlog records.
