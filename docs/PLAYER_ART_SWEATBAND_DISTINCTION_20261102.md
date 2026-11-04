# Existing player sweatband accessory distinction — 2 November 2026

**Status: technical prototype; owner visual acceptance remains open.**

## Change

Headband and Sweatband previously used the same narrow white shape with only a one-pixel vertical offset, making the two Player Studio choices look alike in game. The standard headband is unchanged. Sweatband now uses a wider fabric silhouette, a cooler cloth shade, and a fine lower seam. It remains available in the same views and appearance slot.

## Validation

- `node --test tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — **20/20 passed**. The new regression checks that the regular headband retains its original narrow geometry and that Sweatband has its wider shape, seam, and profile projection.
- `py -3 scripts/build.py` — passed; generated the current browser fixture.
- `py -3 docs/PLAYER_ART_ACCESSORY_SCAN_20261102/browser_gallery.py` — passed in Chromium using the actual gameplay renderer. All **24** accessory/view samples (six accessory choices × four views) were nonblank and unclipped, with **0** page errors. The [130 × 160 game-renderer gallery](PLAYER_ART_ACCESSORY_SCAN_20261102/accessories_4_views.png) shows the distinction across front, quarter-front, side, and back projections.

This is renderer-level evidence only. Human art approval and device acceptance remain open; no release or deployment claim is made.
