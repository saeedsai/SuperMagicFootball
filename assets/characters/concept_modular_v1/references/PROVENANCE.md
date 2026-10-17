# C00/C01 editable illustrated layer provenance

New component: `source/hair_front_front.svg`, a transparent authored, independently editable SVG of graded hair volumes, rim-light strokes and layered fringe. Its source canvas uses the original atlas's front frame (112 × 265), preserving the original 141px logical character height and visual transforms.

Reference: the existing repository `assets/concept_hero/hero_atlas.webp` (532 × 265) and its frame manifest. **No independently layered PSD/KRA/ORA original was in the repo.** The original artist's rights chain and owner art signoff are not documented; obtain permission before reuse beyond this project. The new hair artwork is a newly authored illustrative overlay in the existing painted direction, not a recovery of the original source or a completed interchangeable haircut.

The image is loaded as an SVG runtime asset (also embedded into the deterministic QA fixture), not a misleading poster. One Concept Royals roster item can be previewed via `?conceptModularPreview=1`. Unfinished directions, load failure and absent assets fall back to the existing painted concept character. Other players remain unchanged. WebP derivative, original editable head/body, 7 independent directions, and owner approval are pending.

## C01 rear-view illustrated source

- `source/hair_back_back.svg` (115 × 265) is newly painted editable rear crown/nape/strand artwork, layered with transparent gradients and independently editable SVG paths. It uses manifest pivot `(57,60)` and overlays the original 115px back slice, preserving the original painted player beneath it.
- The new back source is part of the playable opt-in `concept_modular_v1` path, not a generated marketing illustration. Front and back overlays have limited gait-driven hair movement while the legacy body provides existing leg motion. The six unpainted quarter/side headings remain the exact original concept hero.
- No independently layered original PSD/KRA/ORA rights chain was recovered; this layer is new artwork, not a claimed recovered original. Owner acceptance, final layer isolation and the full eight authored directions remain pending.

## C01 illustrated front face — 16 October 2026

- `source/face_front_front.svg` is newly authored transparent, editable painted vector artwork with named `ears`, `head-skin`, `cheeks`, `eyebrows`, `eye-whites`, `irises`, `nose`, `mouth` groups. Source frame 112×265; image composited over the existing painted prototype but under its separately editable front hair. Face pivot (56,99), head center (56,78), ears (21,81)/(94,82), neck (56,110).
- The source is not a recovered original layered Photoshop/ORA/Krita face; no original editable hero master was present. Its colors and geometric styling were authored for the game's current front silhouette, not obtained from third-party character libraries. **Owner art review is required** for facial likeness, expressions, anatomy and game-scale consistency.
- Exactly one opt-in player uses the experiment, with old `concept_hero` fallback on missing art and six unfinished orientations. No independently articulated head, blinking, mouth expressions, player-variant faces or fully isolated torso/arms/legs are delivered by this batch.

## C01 front near-arm painted component — 16 October 2026

- `source/arm_near_front.svg` is a new original, transparent **editable** front near-arm illustration (source 112×265). It contains individually named painted sleeve/trim, upper arm, elbow shading, forearm, blue wristband and fist groups. Its shoulder pivot is (90,126), elbow (102,171), wrist (104,187), hand (104,199); no cropped JPEG or promotional portrait substitutes for source pixels.
- The component uses the existing illustrated Royals blue kit and warm skin tones. The runtime first paints the unchanged legacy hero, then the editable face and the near arm, then the independent hair; a bounded counter-stride of -0.035 radians per existing `run` unit moves the arm around its shoulder without modifying player coordinates, gait timing, collision shapes or match AI.
- The arm overlays baked old pixels: full occlusion and a complete anatomical rig are **not** certified. Opposite arm, dynamic number, goalkeeper skin/kit, six remaining views and original layered artist master are still unavailable. Owner must visually approve fit, transparency and real game-size motion before production rollout.

## C01 painted far-front arm — 16 October 2026

- `source/arm_far_front.svg` is newly hand-authored, transparent, editable SVG artwork (112×265) in the same coordinate space as the approved front prototype. Distinct source groups `far-shoulder-and-sleeve`, `far-upper-arm`, `far-elbow-crease`, `far-forearm`, `far-wrist-tape`, `far-fist` and `far-edge-light` use illustrated royal-blue sleeve shading and warm skin gradients rather than recoloring a flattened full character.
- The far shoulder pivot (23,126), elbow (14,166), wrist (13,180) and fist (11,189) are independently editable in `manifests/rig.json`. The experimental opt-in compositor paints far arm behind the painted face and near arm, followed by front hair; on a nonzero legacy run phase it rotates +0.035 radians per phase, opposite the already painted near arm's -0.035. Physics, root transforms, animations and non-opt-in players remain owned by their original renderers.
- This component overlays the old baked original, which has **not** been decomposed into a clean torso/arm rig. Consequently arm ghosting or collar seams may remain; the new two-arm overlay is not a completed production arm cycle. Original painted layered masters/rights and human art approval remain missing; do not claim fully authored eight-way views, twelve unique characters or accessible production customization.

## C01 separately editable front collar/shoulder seams — 17 October 2026

- `source/torso_collar_front.svg` is a newly hand-authored transparent 112×265 vector illustration containing 18 path elements and seven individually editable shoulder/collar groups. It uses blue kit colors and shared atlas coordinates from the existing local hero source; no purchased, downloaded or externally traced promotional image is embedded. Art file: [`231b7384`](https://github.com/saeedsai/SuperMagicFootball/commit/231b7384ab4b6976240b3bed19187a9decbaeee4).
- Pivots and alpha bounds are documented in `manifests/rig.json`. The experimental player uses the old painted torso underneath. New collar art is composited after the far arm and before the face, near arm and hair, preserving old saved/player identity data and six-direction fallback. The feature is a small neckline artwork improvement, **not an independently isolated full torso** or animation replacement.
- Rights/artist approval for the original source remain unresolved. Human aesthetic signoff and physical-device confirmation are required before claiming approved production-ready graphics.
