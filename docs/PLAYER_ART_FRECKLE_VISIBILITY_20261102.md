# Existing player freckle rendering — 2 November 2026

**Status: technical prototype; owner visual acceptance remains open.**

## Change

Freckle positions used `14 + (i * 7) % 7`, so every dot landed at the same cheek height. Their subpixel radii and low opacity also made them easy to lose in the gameplay-sized sprite. Freckles now vary vertically across the cheek and use slightly larger, clearer dots. The four freckle levels retain their existing dot counts; scar placement and all other face details are unchanged.

## Validation

- `node --test tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — **21/21 passed**. Coverage checks the 0/4/9/14 dot counts, varied cheek heights, and minimum dot size.
- `py -3 scripts/build.py` — passed; generated the current browser fixture.
- `py -3 docs/PLAYER_ART_FRECKLE_VISIBILITY_20261102/freckle_browser_qa.py` — passed in Chromium using the actual gameplay renderer. All four levels rendered without blank or clipped sprites and with **0** page errors. Pixel checksums differ for each freckle level. The [native and scaled game comparison](PLAYER_ART_FRECKLE_VISIBILITY_20261102/freckles_native_and_game_scale.png) shows the full sprite at half scale and a magnified face crop for inspection.

This is renderer-level evidence only. Human art approval and device acceptance remain open; no release or deployment claim is made.
