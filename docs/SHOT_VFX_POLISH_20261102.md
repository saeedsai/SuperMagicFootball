# Super Shot transformation finish polish — 2 November 2026

## Change

All transformed Super Shots now share a restrained segmented orbital arc and a small moving glint around the character/shape. With reduced-flash enabled the cue stays stationary and uses lower opacity. The common whole-sprite sway was slowed from a rapid `.12` radian oscillation at 24 rad/s to `.045` radians at 4.5 rad/s so the bespoke silhouettes read more clearly in motion. Existing shot-specific wing/tail/rotation animations and return-to-ball transition remain intact.

This is renderer-only. It does not alter the ball path, impact force, collision, duration, activation, controls, save data or transformation timing.

## Validation

- `node --test tests/super_shot_visuals.test.cjs tests/sh07_transformed_ball.test.cjs`: **8/8 passed**, including time-varying orbit and stable reduced-flash cues.
- `python -X utf8 scripts/build.py`: passed.
- `python -X utf8 tests/sh07_transformed_ball_browser_qa.py`: Chromium rendered all **32/32** distinct transformations across full-motion, reduced-flash and return rows; reduced-flash release and transform-return checks passed; no browser errors and rendering did not mutate ball position.
- Reviewed preview at `evidence/browser/sh07_transformed_ball_preview.png`.

## Limits

This is local browser evidence. Device readability, human balance/playability, physical-device review and owner visual acceptance remain open.
