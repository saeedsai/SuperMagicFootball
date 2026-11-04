# Ability, trick and dribble input validation — 3 November 2026

## Scope

Verify that distinct dribble styles and skill moves work through the existing four-action controls, that Super Shots and Super Defence can be activated with accessible input combinations, and that touch/desktop paths remain usable. No roster or player identity edits were made.

## Validation

- `node --test tests/super_defence_input_path.test.cjs tests/dribble_trick_audio.test.cjs tests/dribble_fatigue_defence.test.cjs tests/nutmeg_facing_counter.test.cjs tests/rainbow_facing_counter.test.cjs tests/spinning_bumper_defence.test.cjs tests/defence_bat_mace.test.cjs tests/mace_sweep_telegraph.test.cjs tests/supernova_defense.test.cjs`: **49/49 passed**. Super Defence activation reached the engine through keyboard, touch and gamepad Jump+Shoot input.
- `node --test tests/super_shot_gamepad_access.test.cjs tests/ability_shot_ball_shapes.test.cjs tests/shot_catalog_entitlement.test.cjs tests/arcade_shot_trial.test.cjs`: **16/16 passed**. Gamepad Y then A and remapped Jump+Shoot both activate an equipped Super Shot through the existing four-action controls.
- `node tests/four_button_phase2.mjs`: double-tap Dribble triggers a distinct `dribbleTrick` action; cooldown and ball ownership remain valid.
- `node tests/dribble_styles.mjs`: **PASS**, 10 dribble profiles with stamina, cooldown, defensive counter and AI checks.
- `node tests/defensive_abilities.mjs`: **PASS**, two field and two keeper abilities, collision effects, stamina/cooldowns and keeper clearance.
- `node tests/super_shot_reset.mjs`: **PASS**, shot transformation state resets correctly.
- `python -X utf8 tests/abilities_browser_qa.py`: desktop and simulated-mobile defensive ability/GK flows pass using the four-button control scheme.
- `python -X utf8 tests/studio_103_dribble_style_browser_qa.py`: desktop and simulated-touch Player Studio preview/save/read-back/reload pass for all 10 styles; identity fields stay unchanged.
- The Playwright launchers in the two browser checks now select installed Chromium when present and otherwise use Playwright's bundled browser. This keeps the same QA usable on Windows and Linux.

The full Node suite also passes **1,773/1,773**, and data validation passes for 223 teams, 2,676 players and 84 appearance presets.

## Remaining

The controls and mechanic paths are reachable and tested, but human balance/playability review, physical-device acceptance and owner visual review remain open. Super Shot/Defence assignments continue to follow the existing verified role/tier and cooldown rules.
