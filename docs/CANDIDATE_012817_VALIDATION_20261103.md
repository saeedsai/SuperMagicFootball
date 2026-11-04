# Candidate 0.12.81.7 validation — 3 November 2026

## Changes

- Improved the shared gameplay ball with spherical shading, clearer classic panel seams, and a specular highlight. Ball radius, rotation, physics, and hitbox remain unchanged; a non-gradient canvas fallback remains.
- Fixed customization parent-route loss when returning from nested Player Studio, roster editor, and club editor flows. Settings/Home entry is retained through nested editor navigation, and Squad returns to Customize when entered there.
- Kept the existing Home player artwork and reference layout; no new menu or character image was integrated.

## Local validation

- `npm run test:node` — **1,942/1,942 passed**; the 32-club/384-player fixture passed.
- `python -X utf8 scripts/validate_data.py` — passed: 223 teams, 2,676 players, 84 avatar presets.
- Focused render, Super Shot, route and release/version Node contracts — **46/46 passed**.
- Bundled-renderer ball capture — passed with no page errors; shows classic feature size and match size plus the existing Auriverde model ([evidence](MATCH_BALL_QUALITY_20261103.md)).
- Nested customization route browser regression — passed on desktop and simulated-touch Chromium.
- The four-shard portable-Chromium census is being refreshed in [the candidate report directory](qa_runs_012817_browser_windows_20261103/).

These are local working-tree results. Owner visual approval, physical-device/screen-reader acceptance, two-device LAN, exact-head CI, hosted deployment/load, and authenticated online settlement remain separate gates.
