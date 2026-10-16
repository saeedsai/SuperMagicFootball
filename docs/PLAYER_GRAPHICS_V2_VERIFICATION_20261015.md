# SuperMagicFootball — Player Graphics v2 implementation and verification

**Date:** 15 October 2026  
**Branch:** `dev`  
**Scope:** player face, head, hair, facial hair, uniform, facial details, wearable accessories, tattoo rendering, eight-direction identity consistency, and Player Studio previews. Gameplay/roster values not changed by this graphics workstream.

## Production implementation
- `src/modules/characterart.js` is the active vector Canvas2D character painter, invoked from `src/modules/render.js` for gameplay characters and editor previews. One authored front/quarter-front/side/quarter-back/back projection is mirrored by the game to cover eight compass-facing directions.
- The initial vector redesign introduced cel shading, revised heads, hair, body, boots, gloves, accessories, team-kit rendering and keepers. The later corrective passes fixed rear beard edges, beard/lips layering, duplicate hairstyle options 8/12, nose-shape duplication, indistinguishable eyebrow styles, and five different scar and tattoo motifs.
- Existing character IDs, saved appearance option numbers, natural skin and hair palettes, match controls, ball physics, collisions, tactics and squad sizes remain unchanged.
- The displayed concept art is **a style guide**; generated illustration sheets are not transparent/registered sprite atlases. This implementation is runtime procedural cartoon art rather than a pixel-for-pixel copy of those illustrations.

## Exact green CI evidence
| Verification | Observed result | Evidence |
|---|---|---|
| Active Node regression suite after adding full-roster matrix | **29 PASS, 0 FAIL** | [Modular Game Dev QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38774085512) at `ffe09c92` |
| Complete built-in roster render, actual `avatarFor` presets and stored overrides | **223 teams, 2,676 unique players, 84 player-specific records, 13,380 Canvas renders across five base projections, 0 exceptions** | `tests/player_art_all_roster.test.cjs` / Node CI above |
| Directed graphics/browser workflow | **SUCCESS** | [Current Player Graphics and Identity Browser QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38773278314) at `75952c5a` |
| Existing character identity browser checks | **13 PASS, 0 FAIL, 3 NOT EXECUTED** | Browser workflow logs, desktop and simulated-touch Chromium |
| Existing graphics/browser integration | **19 PASS, 0 FAIL** including 12,096 directional sample renders on each of desktop/touch | Browser workflow logs |
| New exhaustive face × beard × hair × direction Chromium sweep | **2,860 raster draws per browser configuration (5,720 total), 0 clipped, 0 blank, 0 missing beards, 0 collapsed hairstyle/nose/lip selections, 0 uncaught errors** | `tests/player_art_directional_qa.py`, browser workflow logs |
| Focused character-art Node unit tests | **7 PASS, 0 FAIL** | `tests/player_art_rework.test.cjs`, browser workflow logs |
| Each Studio option's vector path uniqueness | **5 faces, 13 hairs, 20 eyes, 20 brows, 6 eye colors, 6 noses, 8 lips, 5 beards, 6 accessories, 4 freckles, 6 scars, 6 tattoos distinct in frontal view** | Permanent option-family test in `tests/player_art_rework.test.cjs` and direct geometry trace |
| Fully directional beards and hairstyle shape combinations | **Five face shapes × five beard values × 13 hairs × five principal projections passed headless render; 13/13 distinct hairstyles in each projection** | `tests/player_art_rework.test.cjs` |

The browser workflow also captures `docs/qa_runs_current/player_art_eight_direction_contact_sheet.png` as a downloadable CI artifact, plus JSON/log evidence. The scripted browser exercised the real built test fixture (not an image mock). The Node full-roster check exercised the actual game appearance resolver with every real roster record.

## Known limits and deferred items
- **Human artistic review is still separate from automated QA.** Test success verifies drawing execution, pixel-level distinctness, clipping bounds, and functional customization behavior; it cannot certify a subjective perfect match to the earlier illustrated reference boards.
- **Real-device physical Android/iOS, host-origin process restart saves, offline/PWA deployment and mobile FPS verification are not certified** and remain deliberately deferred by the owner.
- The broader historical full-regression census previously reported stale legacy test expectations and some unrelated keeper/audio tests; do not treat this graphics report as whole-game full-regression signoff. Active game Node contracts and graphics browser workflows above are green.
- The original procedural vector legacy helper routines remain inside `render.js` as compatibility scaffolding. Removing that dead code should only follow isolated browser-fixture migration and full regression.

## Core source/test inventory
- `src/modules/characterart.js` — production art engine
- `src/modules/render.js` — integration
- `data/graphics/art_registry.json` — ownership/index
- `data/graphics/procedural_assets.json` — curated Studio options and palettes
- `tests/player_art_rework.test.cjs` — option uniqueness, combinatorial geometry, keeper/mirror cases
- `tests/player_art_all_roster.test.cjs` — real 2,676-player acceptance
- `tests/player_art_directional_qa.py` — Chromium pixel validation, gallery evidence
- `tests/graphics_integration_v082522.py`, `tests/character_identity_persistence_v082529.py` — inherited runtime/Studio/identity browser regressions
- `.github/workflows/current-player-browser-qa.yml` — repeatable graphical acceptance and retained artifacts

## Suggested next art-only iteration
A designer can review the captured eight-direction sheets at actual in-game sprite sizes, mark precise silhouette and expression quality concerns, and optionally add hand-authored transparent, registered sprites for hero characters while retaining the comprehensive fallback Canvas renderer. Any new components should be validated against the same full-roster and eight-direction CI gates.
