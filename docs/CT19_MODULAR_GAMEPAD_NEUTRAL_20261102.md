# CT19 Modular Gamepad Neutral Guard

Fixed a production-path mismatch: the distributed game imports `src/modules/input.js` through `src/modules/ui.js`, but the neutral-until-release guard had only been present in the legacy `src/input.js` module. The modular runtime now suppresses a held controller after background cancellation or disconnect until it observes a neutral poll. Keyboard input is not cancelled when a gamepad disconnects.

## Validation

- `node --test tests/ct19_gamepad_cancel_resume.test.cjs tests/ct19_gamepad_disconnect_reconnect.test.cjs tests/ct19_input_acceptance_matrix.test.cjs` — 8/8 passed against the modular runtime for the cancel/reconnect tests.
- `node --test tests/ct19_editable_key_passthrough.test.cjs tests/touch_dribble_pulse.test.cjs` — 8/8 passed.
- `python3 scripts/build.py` — built fixture from modular sources.
- `python3 tests/browser_runner_compat.py tests/ct19_modular_gamepad_neutral_browser_qa.py` — desktop and simulated-touch passed. Both verified cancellation and reconnect suppress held Pass, neutral rearms the controller, a fresh press works, four actions remain, and no page errors occur.
- `git diff --check -- src/modules/input.js tests/ct19_gamepad_cancel_resume.test.cjs tests/ct19_gamepad_disconnect_reconnect.test.cjs tests/ct19_modular_gamepad_neutral_browser_qa.py docs/CT19_MODULAR_GAMEPAD_NEUTRAL_20261102.md` — clean.

## Limits

Automated checks use Chromium’s gamepad API stub and simulated touch; they do not replace physical controller/device acceptance.
