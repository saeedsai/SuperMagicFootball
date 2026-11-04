# Mace Sweep CPU Counter

The documented trick fairness gate calls for CPU counterplay. CPU defenders now use the existing difficulty reaction delay to jump away when a Mace Sweep warning targets them. The helper is transient match state and adds no input, roster, or save fields.

## Behavior

- The CPU reacts only to a pending Mace Sweep whose target is that exact player.
- It reuses the established difficulty `reaction` values and the standard JUMP action. The warning lasts 0.24 seconds, so the existing upper difficulty levels can react in time; slower profiles do not receive an impossible response.
- A defender already airborne, dashing, or actively sliding keeps that evasion and is not commanded to jump again.
- Losing or changing the warning target clears the reaction state.

## Validation

- `node --test tests/mace_sweep_ai_counter.test.cjs tests/mace_sweep_telegraph.test.cjs tests/defence_bat_mace.test.cjs tests/spinning_bumper_defence.test.cjs` — 18/18 passed, including all five difficulty profiles, both team directions, and 30/60/120 Hz timing.
- `python3 scripts/build.py` — modular fixture built successfully.
- `python3 tests/browser_runner_compat.py tests/mace_sweep_ai_counter_browser_qa.py` — desktop and simulated-touch contexts issued the existing JUMP counter after 11 60-Hz frames, leaving 0.0567 seconds in the warning; four action buttons remained and no JavaScript errors occurred.
- `git diff --check -- src/modules/engine.js tests/mace_sweep_ai_counter.test.cjs tests/mace_sweep_ai_counter_browser_qa.py docs/MACE_SWEEP_AI_COUNTER_20261102.md` — clean.

## Limits

The browser check exercises the live reaction helper and jump action; it does not replace physical-device or human balance review.
