# Candidate 0.12.81.55 validation

**Status: local candidate; exact-head CI has not started.** This candidate improves in-match graphics and makes the live player Energy HUD accessible without changing the four-action controls or match simulation.

## Changes

- `#staminaHud` now exposes a semantic meter with selected-player name, 0–100 range, current value and text value. The screen-reader value tracks the visible Energy percentage and updates when the controlled player changes.
- Existing-player turns now add a bounded, mirrored head counter-lean layered over the current torso lean. At rest it is neutral; maximum extra lean is 0.095 radians. Movement, facing, timers, inputs, hitboxes and physics are unchanged.
- Wet pitches now draw deterministic, static puddle-light arcs on Classic, Grass, Dirt and Sand. Dry surfaces, game state, and reduced-flash output are unchanged; there is no time-based flicker.

## Validation

- `npm run test:node`: build passed (**5,222,429 JS / 5,345,624 HTML characters**); full Node **2,291/2,291**; Club26/FC27 fixture passed. Release/version contracts passed **20/20**.
- `node --test` focused ball, save, player-head and pitch suites: **60/60 passed**.
- `python tests/stats_browser_qa.py`: desktop and mobile passed; visible energy, semantic meter, selected-player accessible name and live percentage updates were checked.
- `python tests/player_head_turn_counterlean_browser_qa.py`: **9/9** production-player samples across Front, Front-Left and Left with rest/positive/negative turns; state unchanged, no page/console/request errors. Gallery: [player head-turn response](evidence/browser/player_head_turn_counterlean_012855.png).
- `python tests/wet_pitch_puddle_reflections_browser_qa.py`: four terrain × Good/Wet rendered tiles; deterministic surface hashes differ, reduced-flash wet-grass pixels are identical, game state unchanged, no page/console/request errors. Gallery: [wet-pitch reflections](evidence/browser/wet_pitch_puddle_reflections_20261105.png).
- `git diff --check`: pending after final integration.

## Remaining acceptance

- Exact-head Full Regression Census, Modular QA, promotion, Pages deployment, hosted byte/smoke and main Census.
- Owner visual/gameplay approval and physical-device/screen-reader acceptance remain open.
- Online Career/Ultimate Team/PVP hosting still needs the owner-provided server, durable PostgreSQL, OIDC/secrets and backup/restore configuration. Active PVP restart resume still needs a safe authoritative engine checkpoint contract.
