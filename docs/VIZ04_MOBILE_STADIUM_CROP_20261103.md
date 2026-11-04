# VIZ-04 Mobile Stadium Crop QA — 2026-11-03

## Result

The live modular renderer passed the mobile crop matrix for all 20 existing venue IDs at 320×568, 390×844, and 844×390 CSS pixels. Each viewport covered five framing scenarios: center circle, left goal, right goal, top stand/line, and bottom stand/line (300 total renderer samples).

The checks map pitch and goal landmarks through the renderer's actual canvas transform. They also assert no horizontal page overflow, no browser page errors, no gameplay-state mutation during rendering, and distinct center-venue renders for all catalog entries. Every tested landmark stayed inside the intended viewport crop.

## Fix

The Wide camera previously clamped world-space targets as though zooming were anchored at the viewport origin. At 844×390, this clipped the outer goal by about 25 CSS pixels. `src/modules/render.js` now offsets the camera bounds by the centered zoom margin on both axes, including penalty framing. Wide zoom remains 0.86, preserving the larger field span.

## Evidence

- `tests/stadium_touch_crop_browser_qa.py` — 300 live-render samples passed.
- `tests/camera_wide_view.test.cjs` — updated source contract passed for zoom-aware clamps and penalty framing.
- `tests/pitch_length_browser_qa.py` — portrait touch, end tracking, Wide span, and unchanged simulation passed.
- `tests/stadium_01_render_browser_qa.py` — 20 venue renders and distinct turf structure hashes passed; no page errors.
- Focused Node checks for camera, stadium, ground, and weather: 14 passed, 0 failed.
- `git diff --check` passed (Git emitted only existing line-ending notices).
- Contact sheets: `VIZ04_MOBILE_STADIUM_CROP_320X568_20261103.png`, `VIZ04_MOBILE_STADIUM_CROP_390X844_20261103.png`, `VIZ04_MOBILE_STADIUM_CROP_844X390_20261103.png`.

This is browser-renderer evidence at emulated viewport sizes. It does not establish physical-device acceptance or owner visual approval.
