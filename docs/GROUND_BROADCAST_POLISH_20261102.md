# Ground and venue surface polish — 2 November 2026

## Change

Added low-contrast mowing bands and a fixed-direction light pass to the existing pitch ground artwork. The effect is clipped to the playable field bounds and drawn beneath the venue surface details and official field markings. Field dimensions, line geometry, collision/physics data and saves are unchanged.

## Validation

- `tests/ground_broadcast_visual_contract.test.cjs`, `tests/arena_overhaul_visual_contract.test.cjs` and `tests/stadium_01_catalog.test.cjs`: **9/9 focused checks passed**.
- UTF-8 build passed.
- `tests/stadium_01_render_browser_qa.py`: all 20 venues rendered with unique turf/render hashes, picker persistence passed and zero browser errors.
- Gallery screenshot: `evidence/browser/stadium_01_gallery.png` (visual review reported by the rendering workstream).

## Limits

Touch-sized crop review, physical-device performance/readability, full stadium/camera/weather coverage and owner visual acceptance remain open under VIZ-04.
