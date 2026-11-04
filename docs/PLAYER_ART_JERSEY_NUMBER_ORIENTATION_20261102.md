# Existing player jersey number orientation — 2 November 2026

**Status: technical prototype; owner visual acceptance remains open.** The in-game renderer mirrors the complete fallback sprite when a player faces left. Front and quarter-front shirt numbers therefore inherited that mirror and could read backwards.

## Change and acceptance criteria

Within the existing jersey number draw only, left-facing views now apply a matching local horizontal transform so the text remains normally oriented after the surrounding player mirror. The shield, body geometry, kit colors, text position, number fill, number size, and game-facing transform remain unchanged. The correction covers front, front-quarter, rear-quarter, and back numbers. The side profile continues to omit shirt text.

Acceptance checks confirm that positive and negative side renders emit the same number instructions and body/crest geometry, while negative-side text receives one counter-mirror; normal-facing text receives none. Side views still draw no shirt numbers.

## Validation

- `node --test tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — **13/13 passed**, including orientation, kit contrast, and the existing rear number sizing checks.
- A direct 64×64 browser render through the actual game `Renderer.drawPlayer` shows front and front-quarter sprites facing both left and right. Browser page errors: **0**. Screenshot: [left/right number comparison](./browser_render_qa/front_number_left_right_64.png).
- The renderer-selection/fallback path was not changed; the existing procedural art remains the fallback for players without a selected modular model.

This is a graphics-only correction. It does not alter movement, collisions, player identity, saves, or gameplay direction.
