# Player artwork rework — first integrated production pass (2026-10-15)

## Scope and decision
This branch now uses `src/modules/characterart.js` for **every on-pitch player** rendered through `Renderer.drawPlayer`, including preview Player Studio views. The concept boards are art-direction references, not sprite sheets: they contain nontransparent composite panels and cannot be reliably split into eight transparent, registered character atlases. Instead, the game now draws upgraded, reusable procedural Canvas2D characters with cel shading, cleaner facial features, improved hair volume, rebuilt clothing, boots, glasses, headbands and shape-fitting beard geometry.

## Compatibility
- Five explicit view projections (front, quarter front, side, quarter back, back), mirrored left/right by existing render transform, giving eight playable directions.
- Supports existing 5 face shapes, 13 hair styles, 20 eye and brow values, 6 noses, 8 lips, 5 beard styles and 6 accessory settings, 5 body and stature levels, skin and hair palettes.
- All appearance options remain under existing saved data schema, including legacy mouth/lips fallback. Team kits, jersey numbers, goalkeeper gloves, head tilt, match actions, pose logic and editor previews remain wired up.
- No changes to collision, speed, physics, roster, save keys or match rules. Existing game `drawPlayer` animation orchestration remains active.
- Graphics intentionally remain Canvas vector paths, not a baked 3D model or a literal replication of generated concept art.

## Code paths
`src/modules/render.js` imports `CHARACTER_ART` and invokes it where `drawPremiumCharacter` previously rendered the avatar. Previous helpers remain in render.js as reference during transition; removal requires verifying legacy browser fixtures. `data/graphics/art_registry.json` points to the new production art owner.

## QA checklist
- Run `node --test tests/player_art_rework.test.cjs` (new headless no-DOM appearance matrix).
- Run `node --test tests/*.test.cjs` and `node tests/character_art.mjs`.
- Run `python3 scripts/validate_data.py`, `python3 scripts/build.py`, `python3 tests/modular_browser_integration.py` and full browser screenshot QA in a compatible Playwright/Chromium environment.
- Manually inspect front, front quarters, sides, rear quarters, rear for multiple skin tones and every beard/face pair at full-editor and live-match zoom.
- Inspect keeper diving, running, kicking, tackle, and the saved Player Studio profile; check selection and backlit jerseys.

## Known limitations / next iteration
This is a substantial production renderer upgrade but not a completed hand-illustrated atlas for 2,676 distinct players. The existing 13 hairstyle choices are upgraded but not yet extended with separate authored hair-back assets per style; there are no per-character custom UV meshes or facial-motion interpolation. Browser pixel-diff evaluation and physical/mobile FPS validation are still required. If the team decides to match the concept boards literally, commission a clean transparent layered atlas with validated eight-view registrations, and retain this procedural renderer as fallback.

## Testing honesty
The graphics matrix in the new Node test can be run without loading the full match. Until Node/Chromium runners execute against the new commit, do not mark visual tests as passed or claim pixel-perfect matching.
