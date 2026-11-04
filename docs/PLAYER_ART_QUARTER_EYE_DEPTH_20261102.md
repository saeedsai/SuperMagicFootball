# Existing player quarter-view eye depth — 2 November 2026

**Status: technical prototype; owner visual acceptance remains open.**

## Change

The eye painter already received a near/far flag, but did not use it. Quarter-front now slightly softens the far eye's iris, sclera, and catchlights while preserving its existing size and placement. Both direct-front eyes and the side-profile eye retain the full treatment. No facial feature choices, geometry, player data, or renderer selection changed.

## Validation

- `node --test tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — **19/19 passed**. The regression confirms both front eyes keep their original iris color, quarter-front uses both near/far iris tones, and only the far eye receives softer catchlights.
- `py -3 scripts/build.py` — passed; generated the current browser fixture.
- `py -3 docs/PLAYER_ART_EYE_DEPTH_20261102/browser_eye_qa.py` — passed in Chromium through the actual gameplay renderer. Four left/right front and quarter-front renders were nonblank and unclipped, with **0** page errors. The [game-size close-up](PLAYER_ART_EYE_DEPTH_20261102/eye_near_far_game_size.png) shows each full sprite and an enlarged face crop.

This is renderer-level evidence only. Human art approval and device acceptance remain open; no release or deployment claim is made.
