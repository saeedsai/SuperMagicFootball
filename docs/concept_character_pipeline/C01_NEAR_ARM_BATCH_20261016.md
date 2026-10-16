# C01 — One editable illustrated front near arm (checkpoint 16 Oct 2026)

**Branch:** `dev` — latest branch HEAD must be rechecked on each next session because other agents are active.

**Exclusive workstream:** `graphics-renderer` (owner `graphics-c01-near-arm-20261016-gpt6-s12`); bounded companion claims `integration-tooling` for test-fixture embedding and `release-infra` for only the SVG cache entry/version. No gameplay, roster, AI, physics, UI, save or existing procedural player renderer changes.

## Real implemented work

- Authored `assets/characters/concept_modular_v1/source/arm_near_front.svg` (112×265, fully transparent outside arm) with editable named, painted groups: sleeve/trim, upper arm, elbow shadow, forearm, blue wristband and hand; dimensional gradients/outlines matched to the approved Concept Royals palette.
- Added `arm_near_front_001` to the rig manifest with full-canvas coordinates, source crop/alpha estimate, shoulder pivot (90,126), elbow (102,164), wrist (104,174), hand (104,182), part order z=14 and bounded visual-only gait `-0.035 * run`.
- `src/modules/conceptmodular.js` preloads and validates the new image once, preserving original hero underneath it, face below, hair above. The near arm gently counter-swings around the shoulder; legacy complete player remains fallback if any front asset fails and for the six unauthored directional projections.
- `scripts/build.py` includes the new SVG as a base64 string for the deterministic test-only inline fixture. `sw.js` contains and version-caches the new runtime asset.
- `scripts/validate_concept_modular.py`, `tests/concept_modular_v1.test.cjs`, `tests/concept_modular_browser_qa.py`, `tests/concept_modular_live_qa.py` validate layer source, actual match frame differences, transparency, safe fallback, desktop and simulated-touch, and deployed SVG HTTP 200.
- **Visual correction:** first game screenshot showed overly long arm with hand below the approved fist. The lower editable SVG groups were foreshortened about y=150 without altering root/body motion. The corrected asset is `336292ff`.

## Verification & artifacts

- [First arm-art workflow #38904271631](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38904271631) **PASS:** 126/126 active Node, manifest/source, actual desktop+simulated-touch match, original eight-view demo fallback and zero page errors. Its screenshot artifact is the **pre-foreshortening reference**.
- [Original live desktop/touch smoke #38904271644](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38904271644) **PASS** on initial arm source; corrected deployment must be verified separately.
- [Corrected-arm exact-art CI #38905216121](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38905216121) initially pending, check result before marking corrected art accepted.
- [Full regression census #38905216172](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38905216172) initially pending; browser installation and unrelated suites are not graphics-specific. Never mark full release green before all 9 jobs complete.
- Tests: `python3 scripts/validate_concept_modular.py`, `python3 scripts/build.py`, `node --test tests/*.test.cjs`, `python3 tests/concept_modular_browser_qa.py`, `python3 tests/concept_hero_browser_qa.py`, `python3 tests/concept_modular_live_qa.py`, full sharded census. Screenshots in the dedicated QA workflow artifact `concept-modular-real-game`.
- Browser artifacts include real match, original + painted front/back, both front run phases, side fallback and grass/teal/light/dark screenshots on desktop and simulated-touch. No promotional images counted as implementation.

## Known gaps / next five bounded art iterations

1. Validate corrected near-arm anatomy and alpha against original in four backgrounds, at game scale; owner review and adjust seam if required.
2. Paint one independent far/opposite front arm using original blue-sleeve/skin material, with pivot and painter order.
3. Add reciprocal front two-arm gait under existing phase, visually check against leg motion and protect idle.
4. Extract a transparent separately painted front torso/collar with shirt-number continuity and arm-occlusion masks.
5. Isolate near front leg/boot as one new painted part and verify foot-contact stability before second leg or quarter view.

**Remain incomplete:** eight authored views, original master art source/rights signoff, twelve unique player appearances, goalkeeper green kit, dynamic shirt number, articulated torso/other arm/knees/feet, facial expressions, Studio variations and physical phone/tablet tests. The legacy background arm remains under the overlay so larger motion must wait for separately authored torso and occlusion masks. Do not remove unrelated files; other agents own them.

**Next chat start:** read `AGENTS.md`, `docs/agent_coordination/README.md`, every active claim, latest `dev`, this handover and `PROGRESS_TRACKER.json`; claim a bounded unowned graphics feature before touching source.
