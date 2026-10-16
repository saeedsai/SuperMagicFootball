# Modular concept art — asset, rig and runtime specification

## Starting code and constraints
Today src/modules/concepthero.js draws one original flat illustrated five-view WebP from assets/concept_hero/hero_atlas.webp (532 x 265). It cuts torso/two legs and rotates them as a basic run. src/modules/render.js handles field location, pitch shadow, facing, action transforms, size, jump and effects. src/modules/visualfeel.js maps headings to five view kinds plus a side sign. Normal characters use src/modules/characterart.js; keep both old renderers as reliable fallbacks.

## Proposed asset project layout
~~~text
assets/characters/concept_modular_v1/
  references/         # approved concept, rights and version record
  source/             # layered editable artwork (KRA, ORA, SVG, PSD)
  layers/<family>/<view>/<piece>.png
  corrections/<action>/<view>/<pose>.png
  atlases/<resolution>.webp
  manifests/rig.json
  manifests/appearance.json
  manifests/animations.json
~~~
**Do not mistake rendered concept images from chats for existing editable production layers.** Preserve source provenance/licensing, artist review notes and revision. Do not commit third-party art without rights.

## Source canvas, transparency and pivots
- Proposed master art coordinate frame: 512 x 768 pixels, transparent RGBA, at fixed reference pose. Feet contact defined as world-ground anchor (0,0) in rendering coordinates; final projection/scaling still happens once in Renderer.drawPlayer. Canvas size is a *provisional* authoring target, to be calibrated at C00.
- Every exported layer shares the same original coordinate system. Atlas trimmer must store sourceCanvas, cropRect, trimOffset and named pivot for every piece; no unexplained origin changes.
- Per-view anchors: groundLeft/Right, headCenter, jaw, eyes, noseBridge, mouth, hairline, ears, neck, shoulders, elbows, hands/gloveGrip, pelvis, hips, knees, ankles, toe/heel, badge, shirtNumber, captainBand.
- Physical rig: root/pelvis > torso > neck/head > face and front/back hair; left/right upper arm > forearm > hand; upper leg > shin > foot. Each direction gets projected pivots. Use hand-painted corrective frames where a rigid cutout looks unnatural.
- Painter ordering is part of the view/action manifest: far shoe/leg, far arm, hair-back, torso, head, face/eyes, near arm, hair-front, accessories, kit details. Masks handle crossed arms, collars, glasses, near/far ears, ponytails, sleeves and facial hair. Different views need different ordered stacks.
- All non-character pixels fully transparent, with correct premultiplied alpha and antialiasing. QA uses white/black/green/teal check backgrounds, including holes between legs and under arms; never globally remove white (it may be shirt, eye or boots).

## Look requirements
Match the approved illustrated hero's *painted* cheek and eye shapes, layered hair strands, soft highlights, dimensional jersey, pleasant proportions, round hands, boots and clean outlines. Maintain consistency when facing away. Skin and hair changes use material masks / painted value ramps **not whole-image tint**: preserve white eyes, teeth, jersey and outlines. Hair layers include rear nape/volume, fringe/top and optional tail; a headband is always an explicit accessory, never part of the haircut. Beards attach to jaw surfaces and hide behind mouth and nose. Shirt numbers, emblems and captain armband are dynamic overlays, not the baked 10 on existing prototype. GKs use correct green kit and gloves.

## Eight true views, not just mirrors
The target direction IDs are front, frontRight, right, backRight, back, backLeft, left, frontLeft. Current five-view + sign system is an *intermediate compatibility input only*. Author both sides independently when visible content is asymmetric: crest, numbers/text, captain band, tattoo, scar, hair part. Never reverse a shirt number in gameplay. Every component manifest must cover eight view slots, with a documented provisional fallback before full production.

## Proposed renderer interface (NOT yet implemented)
~~~js
CONCEPT_MODULAR.preload(manifest);
CONCEPT_MODULAR.supports(player, appearance);
CONCEPT_MODULAR.draw(ctx, player, view, pose, team, appearance);
CONCEPT_MODULAR.status();
~~~
Suggested integration: first try new modular concept renderer for renderModel === 'concept_modular_v1'; otherwise existing literal CONCEPT_HERO; finally ordinary CHARACTER_ART. Do not change the collision box, team/roster IDs, match rules, or tactical movement. Prepare assets asynchronously and use the old renderer until ready. Avoid memory allocation or Image decoding on every frame.

## Manifest shape (illustrative, NOT a shipped schema)
~~~json
{
  "schema":"smf-concept-modular/1",
  "baseFamily":"royals_base_a",
  "referenceCanvas":[512,768],
  "logicalPlayerHeight":141,
  "viewIds":["front","frontRight","right","backRight","back","backLeft","left","frontLeft"],
  "headAnchors":{"front":{"head":[256,193],"neck":[256,294]}},
  "layers":[{"id":"hair_back","view":"front","asset":"layers/base/front/hair_back.png","anchor":"head","z":1}],
  "bodyRig":"body_balanced_01",
  "defaultAppearance":{"faceId":"face_001","hairId":"hair_001"},
  "fallbackModel":"concept_hero"
}
~~~
A production manifest must additionally include per-layer alpha-bounds, atlas coordinates and trim offsets, pivot coordinates, color material ID, action frame/variant references, source provenance and schema version. Create an automated validator before consuming it in the main renderer.

## Studio and data compatibility
Preserve the current numeric fields skin, hair, style, face, eyes, brows, eyeColor, nose, lips, body, stature, exaggeration, beard, accessory, freckles, scar and tattoo. They currently map to legacy procedural appearance choices. New concept choices should use stable string IDs stored inside a versioned appearance.conceptModular descriptor while maintaining legacy fields and old saves. Player Studio must update and preview the actual painted asset in all directions, preserve unsaved selection while rotating, and save to the existing legend_edits / legend_managerCareer paths. Do not rewrite current saved player/club records automatically.

## Build and offline requirements
scripts/build.py embeds the existing single old atlas as CONCEPT_HERO_INLINE for legacy Chromium tests. Future modular fixture packaging must embed a reproducible bounded asset set OR run on a local served origin (prefer latter for larger atlases). Keep src/main.js modular loading intact, add preloads and sw.js cache listing/version rotation only when runtime assets actually change. Capture the exact deployed source/asset SHA in verification.

## Rig acceptance
One fully painted modular hero first: independent head, eyes, mouth, hair-front/back, neck, torso, both arms, both legs, boots; coherent frontal, side and rear landmark registration. Begin in one direction, test, then author seven more. Painted rig must retain anatomy during running and kicking, have clean transparent overlaps and human-approved in-game silhouette before mass asset production.
