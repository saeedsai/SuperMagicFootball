# Eight-direction character artwork — v0.8.25.32

## Scope

The visual renderer implements five face-shape IDs, 13 hairstyle IDs and five beard-style IDs (0 clean shave, 1 stubble, 2 short beard, 3 full beard, 4 moustache). Presets in `data/graphics/` remain authoritative; the Studio uses selected natural hair and skin colours and preserves old appearance JSON keys. All view kinds: front, right-front-quarter, right-side, right-back-quarter, back, left-back-quarter, left-side and left-front-quarter.

## Change: rear crown identity

Previously the generic nape ellipse in `artHead` covered the distinguishing crown strokes for hairstyle IDs **0, 9 and 12**. The resulting straight rear image hashes were identical (11 distinct of 13). The renderer now calls `studioRearCrownIdentity()` after that ellipse. Style 0 uses short swept tufts; 9 uses a flat-top crown edge; 12 uses subtle close-crop follicles. With the same player, lighting and canvas, all **13/13 styles render distinct rear hashes**.

This is entirely visual. No gameplay bounding boxes, player IDs, saved appearances or collisions are changed. Do not remap style IDs or modify team/player JSON to make the fix work.

## New Studio feature: compare all eight views

On the Player Customization screen, select **COMPARE ALL 8 VIEWS** to show eight labelled static idle portraits. The gallery draws the same `getAppearance()` that drives the primary portrait, not a separate preset. Editing hair, beard, face shape, natural colour and other exposed selectors repaints all eight. The gallery uses a signature cache to avoid drawing eight faces repeatedly during normal animation. The default state is closed and creates no extra gameplay action button.

**Critical save behavior:** toggling the gallery must only add/remove DOM. It must never re-create the Player Studio form and silently discard an edited-but-unsaved selector; no localStorage write occurs until SAVE CHARACTER. Existing `legend_edits` and `legend_managerCareer` persistence layouts remain unchanged.

## Acceptance

- `tests/studio_eight_view_gallery_v082532.py`: 18 PASS across Chromium desktop and simulated-touch. 8/8 distinct direction canvases present; visual signatures, hairstyle updates, 13/13 rear uniqueness, no save-on-preview, preservation of unsaved fields, no JS exceptions.
- `tests/studio_gallery_v082532.test.cjs`: three structural contracts for hair layering, Studio gallery and unchanged gameplay buttons.
- Existing 19-check graphics integration including 12,096 directional poses passes. All 20 inherited Chromium scripts, 146 Node assertions and 24 full match replays pass.
- Human QA reference: `docs/Studio_Eight_Directions_v082532.png`. Screenshot is an editorial view atlas, not a claim of named-player photo likeness.

## Unresolved

Named-player face likeness, occasional overlapping accessories in unusual face/beard/head-scale combinations, and QA on every physical device remain open. The latter is explicitly far-future per project owner. Do not present this fix as certification of physical mobile rendering.