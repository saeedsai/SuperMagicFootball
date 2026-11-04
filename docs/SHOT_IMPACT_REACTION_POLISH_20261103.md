# Shot stun reaction polish — 3 November 2026

## Change

Added timer-bounded launch and confusion poses to `ARTPOSE`. Super Shot launch now eases into a bounded mid-flight tumble, spreads the player's arms, and settles before the existing landing, downed hold and get-up sequence. Shot-stunned players use counter-rotating spiral pupils with a restrained head-cue bob so the dizzy state reads as a comic reaction. Reduced-flash mode freezes the pupils and removes the bob while retaining the existing steady orbiting birds. The renderer only consumes the existing action/stun timers; no action timing, stun duration, collision, movement, controls, saves or player data were changed.

## Validation

- `node --test tests/super_shot_visuals.test.cjs tests/shot_impact_reaction.test.cjs tests/shot_impact_gameplay.test.cjs tests/tackle_animation.test.cjs`: **19/19 passed**.
- `python -X utf8 scripts/build.py`: passed.
- `python -X utf8 tests/shot_impact_reaction_browser_qa.py`: actual game renderer drew seven states: launch ascent, apex, shot-down, get-up, two animated confusion phases, and reduced-flash confusion. All seven renderer captures were visually distinct, player/ball state stayed unchanged, and there were no browser errors.
- Visually inspected `evidence/browser/shot_impact_reaction.png` at the renderer's player scale. After the landing-timer correction, reran `python tests/shot_impact_reaction_browser_qa.py`: the contact sheet now reports nine distinct phases (ascent, apex, down, three get-up states, two confusion states, reduced-flash), unchanged physics, and no page errors.

## Limits

This is local Chromium evidence; owner visual acceptance and physical-device review remain open. The launch and recovery poses use existing action timers and do not change the physics arc or downed/recovery duration.
