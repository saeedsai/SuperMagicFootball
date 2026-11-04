# Gameplay ball surface quality — 3 November 2026

## Change

The shared `Renderer.drawSoccerBall` painter now gives the gameplay ball a broad radial light, a shaded rim, fine classic-panel bevel seams, and a compact specular highlight. The same sphere treatment applies to the available ball cosmetics and to the shared ball renderer used by play, penalties, previews, and Super Shot return transitions.

The canvas clip radius, render position, rotation argument, engine ball state, hitbox, and physics are unchanged. The renderer keeps its original flat base if a Canvas implementation does not support radial gradients. Reduced-flash settings do not add animation to the ball surface.

## Evidence

- [Captured bundled-renderer comparison](MATCH_BALL_QUALITY_20261103.png): classic ball at featured size and match size, plus the existing Auriverde cosmetic, over a pitch.
- `node --test tests/game_ball_surface_render.test.cjs tests/ability_shot_ball_shapes.test.cjs tests/super_shot_visuals.test.cjs` — **13/13 passed** in the coordinator rerun; the renderer agent's broader focused suite passed **19/19**.
- `python -X utf8 tests/browser_runner_compat.py tests/game_ball_surface_render_browser_qa.py` — passed; Chromium reports no page errors and captures three renderer sizes/models.
- `npm run test:node` — **1,942/1,942 passed**, plus the 32-club/384-player fixture.
- `python -X utf8 scripts/validate_data.py` — passed for 223 teams, 2,676 players and 84 presets.
- `python -X utf8 tests/browser_runner_compat.py tests/fix_ui_101_routes_browser_qa.py` — passed on desktop and simulated touch for nested customization parent routes.

The screenshot is automated rendering evidence, not owner visual approval or physical-device acceptance. The four-shard browser census is reported separately in the candidate validation once complete.
