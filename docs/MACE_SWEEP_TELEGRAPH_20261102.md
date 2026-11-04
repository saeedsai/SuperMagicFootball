# Mace Sweep Reaction Window

Mace Sweep now gives opponents a short response window before its existing hit resolves. This closes the Super Defense requirement for a readable tell and counterplay, using the current four-button controls.

## Runtime behavior

- A valid forward, grounded target inside the existing 148-unit arc receives a visible 0.24-second warning.
- The ability spends its existing 0.065 stamina and 10-second cooldown when started. An interruption or successful counter does not refund the cast.
- A grounded SHOOT-slide and a facing, closing defender with stronger Defense counter the pending hit. Jumping, dashing, leaving the arc, or leaving the player list also evades it.
- At resolution, the target, distance, arc, and grounded/dash state are checked again. An uncanceled hit preserves the existing push, stun cap, ball release, and mirrored direction.
- Stun interrupts the caster’s windup. The Canvas warning names JUMP and SLIDE, uses reduced-motion-safe static styling, and adds no button or save field.

## Validation

- `node --test tests/mace_sweep_telegraph.test.cjs tests/defence_bat_mace.test.cjs tests/spinning_bumper_defence.test.cjs tests/magic_wall.test.cjs tests/sd11_wall_families.test.cjs tests/supernova_defense.test.cjs` — 28/28 passed.
- `python3 scripts/build.py` — modular fixture built successfully.
- `python3 tests/browser_runner_compat.py tests/mace_sweep_telegraph_browser_qa.py` — desktop and simulated-touch passed; both verified the 0.24-second tell, visible cue (2,873 orange pixels versus 596 without the cue), grounded slide counter, retained ball possession, no stun, four action buttons, and no JavaScript errors.
- `git diff --check -- src/modules/engine.js src/modules/render.js tests/defence_bat_mace.test.cjs tests/mace_sweep_telegraph.test.cjs tests/mace_sweep_telegraph_browser_qa.py docs/MACE_SWEEP_TELEGRAPH_20261102.md` — clean.

## Limits

Browser checks use simulated touch and do not establish human balance approval or physical-device acceptance.
