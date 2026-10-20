# C01 graphics checkpoint — independently authored rear jersey (20 October 2026)

## Owner priority and change
The owner requested substantial improvement to SuperMagicFootball's character artwork in all eight directions. This bounded C01 step adds a transparent *rear* jersey panel with a legible manually authored number **10**; it is **not** the complete eight-view hero or a new global player skin. All 223 teams, 2,676 player IDs, human controls, saves, physics, camera and non-opt-in graphics are unchanged.

The new `assets/characters/concept_modular_v1/source/torso_back.svg` (115 × 265 transparent canvas) has independently editable shape, collar, shoulder seams, folds, shading and vector number groups. `src/modules/conceptmodular.js` preloads it for the single opt-in demo character, rejects incomplete dimensions, draws it after the legacy rear body but *under* independent rear hair, and leaves unauthored side/quarter views in original fallback. It does **not** mirror the shirt number or falsely claim fully articulated rear body.

Also updated:
- `assets/characters/concept_modular_v1/manifests/rig.json`: source, view, pivot, alpha region and named layer groups;
- `scripts/build.py`: embed `CONCEPT_MODULAR_BACK_TORSO_INLINE` for inherited self-contained Chromium fixture;
- `sw.js`: register SVG in offline cache and version the cache;
- `scripts/validate_concept_modular.py`: verify eight independently editable SVG layers, rear dimensions, name groups, source safety, no raster-in-SVG and no mirroring;
- `tests/concept_modular_v1.test.cjs`: verified manifest contract, rear image readiness, physical canvas draw order under rear hair and untouched other six directions.

## Tests and release acceptance
Target focused suite: `python3 scripts/validate_concept_modular.py && python3 scripts/build.py && node --test tests/concept_modular_v1.test.cjs tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs`. Follow with full Modular Game Dev QA, `Concept Modular First Playable Layer QA`, and nine-job `Full Regression Census` **on the exact final integrated dev SHA**. Actual desktop and simulated-touch rendered screenshots and hosted Pages asset parity are separate gates; only label them PASS when run logs confirm. Physical Android/iPhone and owner visual art approval are **NOT TESTED**.

No changes to generic renderer, game physics, four action buttons, character source identities, saved roster IDs or ordinary render models.

## Remaining artwork defects
Legacy atlas still provides painted arms/legs and most body: front/rear SVG panels are *overlays*, not a genuinely articulated independent eight-view character. Side and quarter directions remain fallback; potential arm ghosting, proportions, hair/beard distortion and 12-player identity differences require their own C01-C09 batches. No artwork automatically passes the owner's visual-quality bar without direct approval.

## Next small follow-ups
1. Inspect real front/back screenshot and torso/arm contour alignment, correct any ghosting or seam offset without changing run physics;
2. Begin one authored side head/body view with guaranteed handedness and readable jersey text;
3. Improve five-face-shape, hair and beard fitting on a selected sample player;
4. Add missing goalkeeper grip and first-touch/run/shot transition visuals;
5. Move from opt-in demo toward a twelve-player visually unique Concept Royals team after approval.

**Development lock:** graphics-renderer plus narrowly scoped integration-tooling and release-infra during this multi-file asset packaging batch. Do not overwrite other agents' work. These scopes must be released with an exact-SHA CI report.
