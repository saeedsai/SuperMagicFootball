# C01 — First independently editable front jersey/torso

**Date:** 2026-10-18 · **Owner:** `graphics-update-c01-front-torso-20261018-gpt6-r5` · **Feature:** `ART-C01-FIRST-FRONT-TORSO` · **Branch:** `dev`

## One bounded graphics improvement
- The newly hand-authored `assets/characters/concept_modular_v1/source/torso_front.svg` is **112×265, transparent, vector-editable** and has **32 paths in 10 individually named groups**: torso outer silhouette, left/right body sides, two shoulder cloths, chest-light panels, folds, jersey number `10`, number undershading, and jersey hem.
- Asset reference is the existing in-repository Concept Royals front hero. The shirt is drawn at the original atlas scale with royal-blue gradient/folds, cream number `10`, and narrow side seams; there is no flat background rectangle, embedded raster, or third-party poster.
- New manifest part `torso_front_001`, pivot/chest center `[56,151]`, estimated alpha `[24,118,89,195]`, z `8.5`. Paint order: unchanged legacy hero base → far arm (z=8) → **painted torso (8.5)** → separate collar (9) → face (10) → near arm (14) → front hair (20). The six unpainted side/quarter views keep original fallback.
- Runtime `src/modules/conceptmodular.js` loads the seventh layer, exposes `torsoLoaded`, and returns false for the complete modular front if its source is absent or has wrong dimensions; ordinary `concept_hero` handles the fallback. Test-only `scripts/build.py` embeds `CONCEPT_MODULAR_TORSO_INLINE`; `sw.js` caches the seventh SVG with a new cache key. New source art commit [`8eabd88e`](https://github.com/saeedsai/SuperMagicFootball/commit/8eabd88e4126ff9446ab21d4ee78e65914c55a62).
- **Not changed:** original baked legs/arms/shorts, player identities, player data, match physics, collision, controls, camera, UI screens, normal renderer or saves. This is the **first independent front jersey panel**, not the final isolated full-body master or baked-arm mask.

## Automated acceptance
- `scripts/validate_concept_modular.py`: XML/SVG canvas and path checks; seven layer IDs, z order, pivot/bounds, ten named groups, number `10`, fallback.
- `tests/concept_modular_v1.test.cjs`: source and number groups, all layers, painter order, missing corrupted torso fallback, legacy directions, arm counterstride, no gameplay mutation.
- `tests/concept_modular_browser_qa.py`: actual match desktop and emulated-touch captured for front, back, side, ±run; compare to original and require correct torso-source alpha/opaque center and no outside pixels, verify no page errors on four contrast colors.
- `tests/concept_modular_live_qa.py`: actual public Pages PC/simulated-touch game and HTTP 200 on source `torso_front.svg`, loaded seventh layer, matching compositor source and playable one-prototype match.
- Full Node suites, nine-job census and About SHA/version tests remain required. GitHub Actions evidence should be appended only when **completed**, with exact commit SHA and any unrelated failures named. Do not substitute a previous run.

## Limitations / next iteration
The original Concept Hero is still drawn beneath the separate torso. This means the original baked arms can become visible if gait amplitude increases. The next small batch must **mask old arms without transparency holes** on light/grass/teal/dark and retain fallback. Human artwork and original-master rights approval, full articulated head/legs and six additional true illustrated directions remain incomplete.

## Next five small graphics batches
1. Visually inspect new jersey/arm seams and fit on four backgrounds; correct one seam if necessary.
2. Occlude the original baked front arms with a reversible paint/mask approach; never alter game physics.
3. Separate the nearer front leg/boot with anchored hip/ankle/toe.
4. Separately illustrate the opposite leg, coordinate foot contact and counterstride with existing arms.
5. Paint a real front-quarter torso/head part instead of mirroring the front artwork; add screenshot/device regression.

**Checkpoint policy:** acquire fresh live claims for graphics, fixture and cache before continuing; never delete provenance, QA artifacts or historical release evidence.
