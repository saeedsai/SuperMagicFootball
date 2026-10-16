# Validation, regression, visual QA and deploy plan

These are release gates for future implementation, not a claim that planned assets already exist. Always tie evidence to the **exact current Git commit** and distinguish tests run now from old historical reports.

## Existing project commands
~~~bash
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/*.test.cjs
python3 tests/concept_hero_browser_qa.py
python3 tests/concept_hero_animation_qa.py
python3 tests/player_art_directional_qa.py
python3 tests/graphics_integration_v082522.py
python3 tests/character_identity_persistence_v082529.py
python3 tests/modular_browser_integration.py
python3 tests/scripted_match_replays.py
~~~
Python browser scripts need Chromium/Playwright; the GitHub workflows install their dependencies. Existing CI: .github/workflows/concept-hero-qa.yml, concept-hero-live-smoke.yml, full-regression-census.yml, and dev-quality / deployment workflows. The inline tests/.generated/play.html is a **test-only** artifact, not the hosted application.

## New dedicated tests as assets arrive
| Gate | Required automated check | Required visual review |
|---|---|---|
| Source & rights | Manifest schema version, stable IDs, source file/reference availability and traceable provenance | Original reference matches approved concept, not a generic approximation |
| Alpha/packing | Full RGBA transparent alpha, trim/pivot bounds, no hidden near-white component, correct WebP decode | No white halos/gaps on grass, teal, light and dark backgrounds |
| Eight views | All 8 authored entries resolve, correct handedness, source anchors and text orientation | One person consistent from front→profile→back; both side tattoos/captain band correct |
| Face feature bank | 17 base selectors and concept extension IDs, visible distinctness where naturally visible | Mouth/eyes/nose/beard never float or overlap improperly |
| Skin/hair palette | Material masks do not recolor eye white, jersey, teeth or background; natural variation | Highlights/shadows remain soft and appealing from light to deep tones |
| Anatomy/body | Shoulder/hip/feet pivots and joint correction references; grounded feet | Tall/short/muscular/slim bodies do not warp shorts, gloves or faces |
| Accessories | Hair/headband/glasses/tattoo fit, side selection and occlusion | No accidental headband or mirrored scar/tattoo |
| Animations | All declared action IDs, time/phase/directions, nonblank transitions | Running hands and feet move naturally; no body separation, foot sliding or paper-doll cuts |
| Keepers | Keeper color kit and number dynamic, gloves, ball attached during hold/dive/release | GK appearance and save/recover credible |
| 12-player demo | 12 distinct head/hair/skin signatures, roles 2 GK/3 DF/4 MF/3 FW | Real game match and eight-view Studio contact sheet, not a promotional image |
| Studio/save | Unsaved edits survive turn; save/reopen, randomizer, import/export and migration | What Studio shows is what match paints |
| Original game | 223 original IDs/order, roster quotas, match physics, input, goal/ball, other team graphics unchanged | Existing playable modes still visually normal |
| Runtime cost | Load errors 0, draw calls/texture memory measured, no repeated atlas decoding | Fluid movement on supported PC and simulated touch; physical devices when scheduled |
| Live deploy | Assets HTTP 200, published commit/asset hashes, cache rotation, real desktop/touch match | Actual deployed players rendered and photographed in browser |

## Nonnegotiable production acceptance
- Zero missing production assets, blank or wrongly clipped characters, nontransparent unintended background, reversed jersey text/numbers, JavaScript exceptions.
- Eight complete views for every *released* part and production action. Missing-but-planned items stay labelled incomplete and use controlled fallback.
- 12 actually distinguishable Concept Royals players including 2 goalkeeper kits, with each visible during running, turning and in a match.
- No physics/hitbox/roster/saved-key change attributable to graphics.
- Old Player Studio numeric IDs not silently renumbered. On a real host, existing saves work and user choices persist after reload; distinguish unavailable real-device evidence from PASS.
- Reviewed screenshots from desktop, touch, front/quarters/sides/back for skin and hair extremes, a sample of beard/head combos and accessories. Owner must approve actual artwork at in-game scale, not only differential pixel statistics.

## Incremental testing routine
Every small batch: validate manifest/schema → component/unit tests → one real browser preview and transparency checkerboard → existing active Node and applicable browser suite. Each completed stage: full 12-character eight-view test, gameplay/match replays, complete current/full sharded regression, exact-commit Pages deploy and real hosted desktop/touch smoke. Save a short test report with PASS/FAIL/SKIP and screenshots. If broad suites take too long, checkpoint and continue next session; never mark tests green when they are still running.

## Screenshots and golden records
Store modest approved sample sheets (e.g. docs/qa_concept_modular/) or use GitHub Actions artifacts. Capture eight views × selected animation phases with annotated character ID, head/hair/skin/kit, source/atlas/commit version. Test multiple background colors and multiple portrait sizes. Compare face landmarks, pivot position, expression and foot contact; visual changes require reviewer decision, not only hash differences.

## Deployment and concurrency
Fetch latest dev before each edit. Prefer new modular file paths; avoid unrelated src/modules/engine.js, data/players or roster edits. If another agent has changed shared render.js, ui.js, build.py or sw.js, reconcile against latest SHA instead of overwriting. No force push. A successful Pages workflow proves a build/deploy, not actual in-game rendering; run hosted Chromium smoke and check the **new modular asset**, not only old concept_hero alpha. Preserve fallback while experimenting. See docs/PARALLEL_DATA_MERGE_GUIDE.md for JSON merge protection.

## Required handover test report format
~~~text
Base dev SHA / actual new SHA / commit link:
Changed source image(s), manifest(s), code path(s):
New validated feature IDs, views and animations:
Regression: node X/X, browser Y/Y, full census, match replay:
Actual screenshot/CI artifacts and owner visual approval:
Deployed exact asset/commit checks and user-facing play URL:
Known issues; intentionally unrun gates:
Updated PROGRESS_TRACKER and next bounded task:
~~~
