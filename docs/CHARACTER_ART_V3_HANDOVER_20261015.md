# Player Graphics III — Full character rendering rework

**Date:** 15 October 2026  
**Branch:** `dev`  
**Replaced:** prior `src/modules/characterart.js` art system  
**Change scope:** player vector graphics, deterministic appearance defaults, Player Studio labels; no gameplay mechanics / collisions / roster ratings were edited.

## Why the white headband showed behind heads
Two independent issues in the prior renderer combined: (1) hair style #8 itself painted a white headband on all views, including back; (2) the deterministic appearance generator assigned `accessory` randomly to ordinary players, creating additional surprise headbands and glasses. The rework repurposes hair style 8 as **Layered Fringe** and paints headbands **only** for explicit accessory #1, preserving the selected accessory across front, oblique, profile and rear views. Headband is a separate customization option.

## What changed in the real engine
- Replaced the existing character painter with a new curved, layered, shaded Canvas2D art system (Character Art III). Includes five authored head projections mirrored to eight directions, revised jaw silhouettes, skin lighting, prominent articulated eyes with iris highlights, ears, nose profiles, beard masking, smile/open mouth expressions, and face details.
- Rebuilt all 13 natural hairstyles as directional locks, sculpted coils, crops, fades and ponytails; rear hairstyles extend to the nape instead of floating or exposing a bald oval. Fixed the common hairband-like rear highlight, overgrown faux hawk, and earmuff-looking side ponytail.
- Rebuilt jerseys, dimensional shading, collar, crest, shorts, visible leg anatomy, striped socks, boots and goalkeeper gloves. Existing kit colors and squad numbers remain intact.
- All 20 brows/eyes, six noses, eight lip styles, five face shapes, five facial hair choices, natural hair and skin colors, freckles, scars, tattoos and accessories are wired to the saved appearance schema.
- Default appearances now **do not invent** headbands, random scars or tattoos for named players. Explicit customization overrides and a curated Ronaldinho headband are still supported.
- Player Studio hairstyle option 8 is now labeled `Layered Fringe`; `Headband` remains accessory #1. The saved indexes, source player IDs, and graphics APIs have not been renumbered.

## Regression and validation evidence
- `python3 scripts/validate_data.py`: 223 teams, 2,676 players, 84 appearance presets, 0 validation errors.
- `node --test tests/*.test.cjs`: 32 inherited/active subtests passed before adding 3 new headband tests; rerun with all files for final count.
- `python3 tests/player_art_directional_qa.py`: **2,860 Canvas rasters per desktop/touch run**, zero blank/clipped characters, zero collapsed lip/nose/hair variants, zero missing rear beards.
- `python3 tests/character_identity_persistence_v082529.py`: **13 pass, 0 fail, 3 intentionally not executed** (real-origin reload, real browser profile restart, physical device controller).
- `python3 tests/graphics_integration_v082522.py`: **19 pass, 0 fail**, including 12,096 per-layout real roster directional/pose renders. (Runs longer than a minute with the more detailed character model.)
- `python3 tests/character_art_v3_visual_qa.py`: 12 named player appearances × 8 directions, screenshot and actual page error capture; separate 3-view band/no-band sheet. Output under `docs/qa_runs_character_art_v3/` (CI artifact or local generation).
- `tests/player_art_all_roster.test.cjs`: renders **all 2,676 records × 5 projections = 13,380** with all 84 stored override records, checking Canvas arithmetic and state.

## Known scope and next art acceptance
This is a full **procedural rendering engine** replacement rather than a production hand-painted sprite atlas. It is significantly more detailed and smoother, but screenshots should be reviewed artistically at live-game scale; passing raster tests does **not** prove photographic player likeness or literal reproduction of concept illustrations. Testing does not certify Android/iOS physical-device FPS or actual hosted-origin save/restart, which require a separate device/origin environment. Historical full-regression scripts with obsolete boot/version assumptions are maintained separately from the active browser/Node suites.

## Key sources
- `src/modules/characterart.js` — full replaced character rendering engine.
- `src/modules/expanded.js` — curated headband/scar/tattoo defaults and signature hairstyles.
- `data/graphics/procedural_assets.json` — customization label mapping.
- `tests/player_art_v3_contract.test.cjs`, `tests/player_art_all_roster.test.cjs`, `tests/player_art_rework.test.cjs` — headband / real roster / full appearance smoke.
- `tests/character_art_v3_visual_qa.py` — 12-player eight-direction PNG gallery.