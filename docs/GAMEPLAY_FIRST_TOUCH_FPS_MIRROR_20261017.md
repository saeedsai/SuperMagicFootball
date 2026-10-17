# First-touch mirrored FPS gameplay acceptance — 17 October 2026

**QA feature:** `QA-FIRST-TOUCH-FPS-MIRROR-ACCEPTANCE` · exclusive `qa-framework` claim. This is an acceptance/regression requirement for the **already playable** pressure-aware ground-pass mechanic, not a second new ball physics feature.

## Why this matters
The new 0.24-second receiver settling changes movement under defender pressure. Acceptance must demonstrate that the same named teammate pass behaves consistently at 30, 60 and 120 frames per second, whichever team attacks, while existing four-button input, ball ownership and meaningful pass events are preserved.

## Delivered and allowed scope
- `tests/first_touch_mirror_fps.test.cjs`: execute the **actual** first-touch helper, live extracted `GameEngine.take`, and `moveAgile`; 30/60/120 FPS, both sides, DRB 25/95, pressure vs clear space, interception, keeper, stunned and aerial exclusions, recovery, no ball speed modification, About version contract.
- `tests/first_touch_mirror_fps_browser_qa.py`: start a genuine Quick Match in Chromium desktop and simulated touch. Twelve real engine passes and receptions per device cover two teams × three FPS × pressure/free cases, with strict event/possession/button counts, exact 0.24-second release and mirrored direction metrics.
- This independent specialist handover and a concise docs/NEXT_MILESTONES.md acceptance checkpoint. No engine, AI, input/UI, audio, art, build, CI, roster, save schema or shared QA runner changed.

## Acceptance bounds
Equal mirrored attributes must yield equal absolute horizontal travel. Pressured skill 40 travel must be positive and less than unpressured travel, with 0.24 s timer completely expired. Cross-FPS variance in 0.24-second cumulative travel must be under 7.5 field units, avoiding false claims of physically identical frame-step integration. Real events must be one accurate/friendly pass receipt. Tests do not assert actual physical iPhone/Android results or real latency/jitter.

## Verification checkpoint
Exact GitHub action links, PASS/FAIL counts, Pages build commit and deployed desktop/touch smoke must be recorded after `dev` integration; never count cancelled workflows as passing. Full regression should include 4×Node and 4×Chromium sharded scripts. Existing About shows latest `dev` SHA upon opening online, separate from GAME BUNDLE. If another audio or UI agent exposes a separate census defect, report clearly without modifying their protected source.

## Planned next five gameplay iterations
1. Integrate and sign off mirrored FPS first-touch acceptance, then address measured deviation rather than guessing physics values.
2. Independently calibrate keeper ordinary/corner versus nonlinear Super Shot outcomes across both sides and fatigue states.
3. Deliver deliberate manual goalkeeper hold/distribution timing under a free gameplay-engine claim; CPU/pressure emergency clearances retain safe behavior.
4. Improve halftime CPU coaching and career bench recommendations under available gameplay/UI claims, preserving 4 controls and saves.
5. Complete physical handset reliability, offline/restart save verification and remaining original rules/multiplayer roadmap only after scope ownership and deployment evidence.

No historic tests, gameplay fixtures or art assets were deleted without proof that they were unused; the shared render/build and old historical files are owned or referenced elsewhere.

## First integrated QA results — verified 17 October 2026
- [PR #22](https://github.com/saeedsai/SuperMagicFootball/pull/22) merged into shared dev at [`9a56bfc302aa75c969a2aca1441336a51e643eb0`](https://github.com/saeedsai/SuperMagicFootball/commit/9a56bfc302aa75c969a2aca1441336a51e643eb0), preserving other agents' changes. The source is **tests and docs only**: no new runtime gameplay mechanic has been claimed.
- Initial [Modular QA #39025557842](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025557842) exposed a new test strict-float comparison (`0.24` second timer left `1.3878e-17`), correctly patched on dev in [`3c2feb664feb6ce58f8146d1027c8c7aecc7380e`](https://github.com/saeedsai/SuperMagicFootball/commit/3c2feb664feb6ce58f8146d1027c8c7aecc7380e) with finite nonnegative epsilon (`< 1e-9`) in both Node and Chromium assertions. No engine change.
- Exact corrected [Modular QA #39025635271](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025635271): **262 Node subtests; 261 PASS, 1 FAIL**. All **six new** first-touch FPS/mirror/control/exclusion tests PASS (cases #82–87). The **sole failure** is `tests/project_memory_contract.test.cjs` with `graphics-update: missing ## Mission`, unrelated to our tests and owned by the graphics chat's own memory. Additional evidence was commented to [Issue #13](https://github.com/saeedsai/SuperMagicFootball/issues/13) without opening/modifying that other agent's memory.
- The `Full Regression Census` workflow's push-path allowlist does **not** list either `first_touch_mirror_fps*.{cjs,py}` test, so our docs/test-only commit did not trigger a *new exact-source* 4+4 census. The test suite is auto-discovered by the runner when the workflow is dispatched or triggered by an owner-allowed source path. A **real Chromium pass for this new file remains unverified** until such a run completes; do not claim desktop/touch pixels or frame steps have been certified simply because the test was added.
- Source [Pages deployment for corrected tests](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025635044) **SUCCESS**. The public hosted Quick Match still requires a *post-deploy* PC/touch smoke; physical iOS/Android browser, speakers and PWA remain outside automated certification.
- Cleanup scan should preserve historic QA evidence and referenced assets; this isolated QA batch introduced only two new test files and one report and did not alter the shared QA runner, build scripts or any live match file.

### Next QA handoff
After the indexed graphics chat owner corrects their own memory contract and release-infra owner adds this test pair to the Census push-path allowlist (or launches `workflow_dispatch`), obtain all 4 Node + 4 browser shard results and inspect the `first_touch_mirror_fps_browser_qa.py` job log. If the new scenario fails, take a fresh gameplay-engine claim before altering runtime. Report exact successful deployed commit ancestry and rerun hosted smoke afterward.
