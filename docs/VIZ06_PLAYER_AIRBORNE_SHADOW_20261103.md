# Airborne player shadow depth — 3 November 2026

## Change

Live and preview player rendering now softens and broadens the existing ground shadow as player lift increases. At ground level the original ellipse remains exactly 29×10 at its existing position and opacity. The bounded visual response reaches 45×13 at 240 world units of combined player/ride lift, while shadow opacity falls by at most 46%. No physics, player position, collision, stamina, save data or input changes.

## Validation

- `node --test tests/player_airborne_shadow.test.cjs`: **1/1 passed**.
- `python -X utf8 scripts/build.py`: passed.
- `python -X utf8 tests/player_airborne_shadow_browser_qa.py`: actual Canvas renderer passes at lift 0, 120 and 240. The original ground sample is unchanged, the airborne outer shadow becomes progressively visible, player state is unchanged, and Chromium reports no page errors.
- Rendered gallery: `evidence/browser/player_airborne_shadow.png`, visually inspected. It shows the same illustrated player lifted above a steady ground contact shadow.

This machine-rendered sample is scoped evidence only; it does not constitute physical-device or owner visual approval.
