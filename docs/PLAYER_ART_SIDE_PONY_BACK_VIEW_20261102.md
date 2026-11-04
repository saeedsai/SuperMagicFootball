# Existing player Side Pony rear projection — 2 November 2026

**Status: technical prototype; owner visual acceptance remains open.**

## Change

Side Pony (style 10) had a rear-view tail that ended inside the skull silhouette, making the back projection resemble the short hairstyles. The rear ponytail now extends below the nape, with a narrow hair highlight so it remains legible at game scale. Its tie and side-view placement are unchanged; other hairstyles, body geometry, kit, appearance data, and renderer selection are unchanged.

## Validation

- `node --test tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — **17/17 passed**. The new regression requires the rear tail and highlight while checking the existing side-view ponytail placement.
- `py -3 scripts/build.py` — passed; generated the current browser fixture.
- `py -3 docs/PLAYER_ART_HAIR_PROJECTION_SCAN_20261102/gallery.py` — passed in Chromium using the actual gameplay renderer. All **65** combinations (13 hairstyles × 5 principal views) were nonblank and unclipped, with **0** page errors. The [game-rendered gallery](PLAYER_ART_HAIR_PROJECTION_SCAN_20261102/hair_13_styles_5_views.png) shows the back-view ponytail alongside all other current styles and projections.

This is renderer-level evidence only. Human art approval and device acceptance remain open; no release or deployment claim is made.
