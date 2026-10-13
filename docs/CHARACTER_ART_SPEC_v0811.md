# Character art renderer — implementation notes (v0.8.11)

Changes confined to `src/render.js`. `faceShapeOutline(ctx,face,width)` generates five deterministic heads with contrasting jaw/cheek geometry; `drawHairSilhouette(ctx,style,hair,dark)` draws thirteen distinct silhouettes: spiky, swept, crop, middle-part, pompadour, mohawk, bun, long, headband/curls, flat-top, ponytail, afro, buzz.

`Renderer.drawPlayer` now calls those helpers for every character while using existing `avatarFor(player)` and per-player `appearance` overrides. The face and hairstyle values persist under old saved schemas; no additional source fields are required.

Additional visual refinements: nose templates, dynamic blink (disabled while hurt, crying or performing super shot), eye catchlights, shoe laces and jersey trim, small silhouette-dependent horizontal/vertical scaling, ear shadows, existing joy/cry/stun animation preserved.

These draw calls remain resolution-independent Canvas vector primitives. They do not alter gameplay positions, world dimensions or collision geometry. The five and thirteen numbers describe available **renderer shapes**, not the planned complete customizable face/hair creator; no famous player likeness guarantee.

Focused tests: `tests/character_art.mjs` checks 5 face path signatures, 13 hair path signatures, 65 rendered combinations and 260 stable avatar records; `tests/character_art_browser_qa.py` checks gallery and gameplay rendering with no Chromium exceptions on both viewport sizes.
