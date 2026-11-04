# Existing player rear-ear projection — 2 November 2026

**Status: technical prototype; owner visual acceptance remains open.**

## Change

The direct back view had no ear detail, leaving short-hair silhouettes as smooth featureless ovals. Both ears are now placed at the rear head's outer edges before the head fill, so the silhouette naturally occludes their inner edges and longer hairstyles may cover them where appropriate. Quarter-back retains its existing single visible near ear; other views are unchanged.

## Validation

- `node --test tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — **18/18 passed**. The regression checks the two back-view ear placements and preserves quarter-back's single-ear behavior.
- `py -3 scripts/build.py` — passed; generated the current browser fixture.
- `py -3 docs/PLAYER_ART_HAIR_PROJECTION_SCAN_20261102/gallery.py` — passed in Chromium through the actual gameplay renderer. All **65** hairstyle/view combinations (13 styles × 5 principal views) were nonblank and unclipped, with **0** page errors. The [game-size gallery](PLAYER_ART_HAIR_PROJECTION_SCAN_20261102/hair_13_styles_5_views.png) shows the rear ears on short cuts while side/long hair retains its natural occlusion.

This is renderer-level evidence only. Human art approval and device acceptance remain open; no release or deployment claim is made.
