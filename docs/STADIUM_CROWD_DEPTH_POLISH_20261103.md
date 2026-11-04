# Stadium crowd depth polish — 3 November 2026

## Change

Replaced the block-like crowd pixels in the existing stadium stand tiers with small two-tone head-and-shoulder silhouettes. Colors still come from each venue's existing palette and deterministic pattern. The existing five tiers, crowd count, venue cache, silhouettes, roof motifs, official pitch geometry and game physics remain unchanged.

## Validation

- `node --test tests/stadium_01_catalog.test.cjs tests/stadium_02_crowd_silhouettes.test.cjs tests/ground_broadcast_visual_contract.test.cjs tests/arena_overhaul_visual_contract.test.cjs`: **11/11 passed**.
- `python -X utf8 scripts/build.py`: passed.
- `python -X utf8 tests/stadium_01_render_browser_qa.py`: all **20/20** venue render and turf-structure hashes were distinct; venue selection persisted after reload; no page errors.
- Reviewed the full venue gallery at `evidence/browser/stadium_01_gallery.png` and a game-scale stand close-up at `evidence/browser/stand_detail_closeup.png`.

## Limits

This is a modest crowd-detail pass, not a full stadium-art overhaul. Physical-device performance and owner visual acceptance remain open under VIZ-04.
