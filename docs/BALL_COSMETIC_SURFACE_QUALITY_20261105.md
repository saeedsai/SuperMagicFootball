# In-match ball cosmetic surface quality — 5 November 2026

## Change

The existing Meteor, Ice, Gold, and Retro balls now receive six curved, spherical-projected seam lines at the renderer's existing ball radius. Each skin keeps its current colored motif and uses its own subdued seam color. A small per-skin specular tint distinguishes their material highlights. The Classic design stays on its existing panel and lighting path.

The renderer changes only pixels. It does not alter ball radius, rotation, movement, collision, selected cosmetic, save data, or accessibility settings. Seams and highlights remain clipped to the circular ball surface, while the existing no-gradient Canvas fallback still draws without the new specular tint.

## Acceptance criteria

- All four existing themed skins retain their base artwork and selected model identity.
- At the 17-unit match radius, curved panel seams and material highlights are visible across different rotations.
- The Classic ball's panel count, colors, and highlight path remain unchanged.
- Drawing preserves the ball's physics state, selected cosmetic, and rotation value.
- The painted footprint stays within the declared ball radius plus its existing outer-outline allowance.
- The actual modular game loads with no page errors, console errors, failed requests, or HTTP error responses.

## Validation

- `python -X utf8 scripts/build.py`: passed (5,151,373 JavaScript / 5,274,385 HTML fixture characters).
- `node --test tests/game_ball_surface_render.test.cjs`: **9/9 passed**.
- `python -X utf8 tests/game_ball_cosmetic_quality_browser_qa.py`: passed against the actual modular game over local HTTP. Captured all five models at featured and 17-unit match scales; checked every model across all five rotations (**25 match-scale combinations**), verified unchanged ball and options state, counted **1,029 painted pixels per sample**, and bounded every sample to a maximum radius of **18.18** (limit 18.25). Browser page/console errors, failed requests, and HTTP errors: **0**.
- Gallery: [five ball models at featured and match scales](evidence/browser/ball_cosmetic_surface_20261105.png).

The screenshot and automated checks are renderer evidence, not owner visual approval or physical-device acceptance. Integrated full-suite and exact-head release gates remain for the coordinator.
