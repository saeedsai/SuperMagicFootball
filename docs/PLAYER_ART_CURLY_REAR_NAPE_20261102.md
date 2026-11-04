# Existing player Curly Volume rear-view polish — 2 November 2026

**Status: technical prototype; owner visual acceptance remains open.**

## Change

Curly Volume (style 11) had a row of flat, dark curls across the rear nape that read as a separate band from the dimensional curls above it. The row now follows a shallow rounded contour around the back of the skull and uses the same gradient and outline treatment as the hairstyle's other coils. This changes only style 11's rear-view hair details; all other styles, body geometry, kit, appearance data, and renderer selection are unchanged.

## Validation

- `node --test tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — **16/16 passed**. The focused regression verifies all nine rear nape curls follow the curved positions and use the hairstyle's dimensional outline style.
- `py -3 scripts/build.py` — passed; generated the current browser fixture.
- `py -3 docs/PLAYER_ART_HAIR_PROJECTION_SCAN_20261102/gallery.py` — passed in Chromium through the real gameplay renderer. All **65** combinations (13 styles × 5 principal views) were nonblank and unclipped, with **0** page errors. The [game-rendered gallery](PLAYER_ART_HAIR_PROJECTION_SCAN_20261102/hair_13_styles_5_views.png) shows the full style/view set at 120 × 180 px per sprite.

This is renderer-level evidence only. Human art approval and device acceptance remain open; no release or deployment claim is made.
