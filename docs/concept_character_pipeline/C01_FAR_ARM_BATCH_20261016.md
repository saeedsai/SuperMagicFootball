# ART-C01 — Editable far-front arm and reciprocal motion

**Batch date:** 16 October 2026 | **Source SHA:** [`f0fea598668803dbc2e54b9ad8f31e9f51cccd23`](https://github.com/saeedsai/SuperMagicFootball/commit/f0fea598668803dbc2e54b9ad8f31e9f51cccd23) | **Artwork SHA:** [`7aa48f911e559dd5a4bc1b9a748a0c2b46651316`](https://github.com/saeedsai/SuperMagicFootball/commit/7aa48f911e559dd5a4bc1b9a748a0c2b46651316). Limited to the `graphics-renderer` claim with narrow `integration-tooling` and `release-infra` companion claims for the QA fixture and offline cache.

## Actual delivered graphics

- `assets/characters/concept_modular_v1/source/arm_far_front.svg` (112×265): independent, transparent, editable painted blue sleeve, upper arm, elbow crease, forearm, wrist tape, fist and edge highlights. 26 paint paths, no embedded raster image, no promotional artwork.
- `manifests/rig.json` adds `arm_far_front_001` with shoulder [23,126], elbow [14,166], wrist [13,180], fist [11,189] and per-view alpha/source bounds.
- `src/modules/conceptmodular.js` draws far arm behind painted face and near arm, then hair; subtle +0.035 radians per existing run phase opposite the near arm's -0.035, keeping idle static and legacy hero fallback for unpainted directions and missing assets. No gameplay, AI, physics, roster/player stats or save-format changes.
- `scripts/build.py` now embeds `CONCEPT_MODULAR_FAR_ARM_INLINE` in QA only, `sw.js` adds the SVG to versioned offline cache. Validator and dedicated Node/browser/hosted tests updated.

## Executed test evidence

| Gate | Result |
|---|---|
| XML/alpha/pivot/asset source checks | **PASS**, 5 editable layers |
| Active Node suite | **147/147 PASS**, 0 FAIL |
| Desktop actual game match / illustrated projection | **PASS**, 4,266 pixels differ from legacy front |
| Simulated-touch actual game | **PASS**, identical new front delta |
| ±run phases | **PASS**, 4,109 pixels differ; small reciprocal arm strokes drawn |
| Original side projection fallback | **PASS**, pixel-identical |
| Front/rear source alpha on contrasting backgrounds | **PASS**, far arm no stray pixels or opaque matte |
| Existing Concept Royals 8-view browser and 12-slot demo | **PASS**, no page errors |
| GitHub Pages desktop/touch match | **PASS** at verified descendant, all 5 SVG and renderer HTTP 200 |
| Full contemporary nine-job census | **NOT GREEN**: source run cancelled; newest comparable preflight blocked by unrelated game-developer-6 memory identity check |
| Real physical devices and owner art signoff | **NOT TESTED / pending** |

[Dedicated illustrated source + actual-game screenshots #38913908449](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38913908449) and [hosted Pages real-match #38914486909](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38914486909) are the positive acceptance sources. Hosted verified descendant `f0858269cf8cf1419b8b78d25f0d7be21798eda1` did not modify the illustrated SVGs or modular source (GitHub compare checked). The first host run [#38913908717](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38913908717) failed while Pages lagged; it is superseded by the successful later run. [Full census #38914777848](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38914777848) failed at **unrelated** project-memory identity preflight before sharded tests. Do not claim that a full current regression passed.

**Screenshot evidence:** `concept-modular-real-game` workflow artifact includes `desktop_actual_match.png`, `touch_actual_match.png`, `desktop_front.png`, `desktop_frontRunA/B.png`, `touch_frontRunA/B.png`, and four background composites. Screenshot review found no obvious disconnected fist or shoulder in the small painted poses, but the arm/torso underlay remains baked and still requires human aesthetic approval. This is implemented graphics inside the game, not a marketing image.

## Risks and planned next five small batches

1. Front seam and occlusion review on contrasting backgrounds.
2. Individually editable front torso and collar, source pivots and z-layers.
3. Hide residual baked arm pixels using limited torso masks while retaining fallback.
4. Independently paint one boot/leg and verify contact during inherited gait.
5. Author matching opposite leg with foot-plant loop, then stage a true quarter direction.

**Legacy safeguards:** original 223 teams, player stats, formations, physics, controls, save values and ordinary procedural drawing not edited. Only the one opt-in preview character shows the new painted arm. C00/C01 remain in progress; full eight directions, player variety, independent bodies, complex moves, GK kits and Studio customization require later milestones.
