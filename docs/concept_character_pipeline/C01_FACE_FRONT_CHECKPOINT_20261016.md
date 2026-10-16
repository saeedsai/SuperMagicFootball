# C01 — First independently illustrated front-face layer

**16 October 2026 — small artwork-only checkpoint.** Graphics claim: `graphics-c01-face-20261016-1354-gpt6`, lock `graphics-renderer`; narrow packaging locks `integration-tooling` and `release-infra`. Baseline `dev` before claims: `b5e59a275f53366ef56afea25f1a6bb13efdbaea`. First runtime commit: [`10ef810f`](https://github.com/saeedsai/SuperMagicFootball/commit/10ef810f16b08ddc869f5dbdb0da1e29bb99a22d).

## Shipped scope

- Genuine independently editable illustrated SVG: `assets/characters/concept_modular_v1/source/face_front_front.svg` has original painted gradients, individual head/ear/eye/brow/nose/lip/cheek paths, transparent outside face, and named source editing groups.
- Manifest `assets/characters/concept_modular_v1/manifests/rig.json` declares `face_front_001` (112×265), full canvas crop, alpha bounds, face pivot, ears, neck and painter z below the existing front hair.
- `src/modules/conceptmodular.js` preloads and dimension-checks the face. It draws only after the original `CONCEPT_HERO` returns success, underneath the independent front hair. Failed face/image load and six unfinished directions preserve the original prototype.
- `scripts/build.py` embeds the experimental face for deterministic browser tests; `sw.js` rotates the asset cache and includes the face on hosted/PWA loads. This is graphics packaging only; no game mechanics, player IDs, ratings, physics, inputs, saves, normal team rendering or menu changes.
- Validator, Node contracts, desktop/simulated-touch browser real-match checks, image alpha bounds and four background screenshots and hosted-asset fetch updated. Full-census trigger now includes this graphics feature.

## Acceptance gates

Check current exact-SHA action status before marking complete:
- [Concept Modular First Playable Layer QA](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/concept-modular-v1-qa.yml)
- [Hosted desktop and simulated-touch modular smoke](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/concept-modular-live-smoke.yml)
- [Full Regression Census](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/full-regression-census.yml)
- [GitHub Pages build/deploy](https://github.com/saeedsai/SuperMagicFootball/deployments)

Individual source and regressions should distinguish **PASS, FAIL, PENDING**. The gameplay threshold test that failed on an early intermediate commit was unrelated to this graphics task and must not be changed without gameplay ownership. Latest relevant general game QA later recovered. Browser screenshot approval is not implied by automated pixel changes.

## Known gaps and next five small iterations

1. Inspect full-size and match-size face registration to existing crown/ears, and grass/teal/light/dark alpha edges. Correct only this layer if needed.
2. Add genuinely editable arm/hand artwork for one front-side near arm plus its shoulder anchor.
3. Author the opposite front arm, add a two-arm gait alternating against preserved legacy legs.
4. Split torso/collar/upper shirt from the flattened prototype, avoid baked number duplication; align face/neck seam.
5. Extract front knees/boots/feet and build the first planted-foot idle/run loop; only then begin one new independent quarter-view head.

**Still incomplete:** original layered painted master, full head and back/profile face variants, animation of eyes/expressions, true articulated torso/arms/legs, six illustrated views, distinct faces for 12 players, dynamic kit numbers and GK kits, full Studio options, approval from art owner, physical-device certification.

## Next-session handover

Read `AGENTS.md`, `docs/agent_coordination/README.md` and active claims first. Use latest `dev` rather than this baseline; preserve other developers' patches. Test `python3 scripts/validate_concept_modular.py`, `python3 scripts/build.py`, `node --test tests/*.test.cjs`, `python3 tests/concept_modular_browser_qa.py`, original concept browser QA, full sharded regression, and deployed desktop/touch. No unrelated files were cleaned up because concurrent agents may still own/reference them.

## Verified output (exact graphics source commit `a8553002`)

- [**Dedicated illustrated graphics QA PASS**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38899003730): editable XML/alpha/pivots/provenance validator and deterministic build PASS; **97/97 active Node tests, 0 failures**; desktop and simulated-touch Canvas render PASS. New front modular sprite changed **3,259 pixels on desktop** and **3,263 on simulated touch** relative to old painted player; rear kept its **2,531/2,523** changed pixels. Unfinished side fallback is **pixel-identical**, opposite run phases remain distinct, original illustrated 8-view/12-roster test passes and 0 JavaScript page errors.
- Source-face alpha in actual Chromium: 112×265, **4,594 visible source pixels**, **0 pixels outside the bounded face region**, **0 stray near-white matte pixels**; composited on grass/teal/light/dark test backgrounds. Real match and face-vs-original screenshots saved as [GitHub Actions artifact](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38899003730) (`concept-modular-real-game`).
- [**Hosted Pages desktop/touch PASS**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38899003632): actual deployed modular head and two hair layers loaded; face/front-hair/rear-hair SVG and renderer HTTP 200, one opt-in player active in a playable match, zero page errors. [Pages build PASS](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38899003851).
- [**Full sharded regression: NOT GREEN initially**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38899003690): preflight/4 Node shards/2 browser shards PASS; browser shard 2 fails an unrelated `team_combos_browser_qa.py` noLaunch/cross/kicks expectation, and browser shard 3 fails before tests because Snapcraft returned HTTP 408 while installing Chromium. GitHub Actions failed-job retry requested. Do **not** conflate these with face-renderer or source tests; do not edit engine/gameplay to work around them without ownership.
- Art reviewer: **not approved yet**; visual prototype is closer after reducing oversized cartoon eyes and replacing broad grin with a subtle smile. Still an experimental overlay on the original painted body; not an independently rigged completed character.

**Delivery scope:** C01 only; protected regular 223 game teams, 12-slot demo composition, player data and saved IDs, gameplay physics, controls and character fallback. The final face art and hosted images were verified; physical phones/tablets not tested (only simulated touch). One future small iteration is preferred over broad feature cleanup while other agents continue.
