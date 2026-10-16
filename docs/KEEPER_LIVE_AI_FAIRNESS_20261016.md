# GK-LIVE-AI-CALIBRATION-QA — actual keeper AI and nonlinear Super Shot evidence

**Date:** 16 October 2026  
**Exclusive lock:** `gameplay-engine`  
**Owner session:** `keeper-live-ai-cohort-20261016-1445-gpt6`  
**Initial source:** `d7a2acc6e73aea11b2feceedf2d300b6e550fdfe`  
**Changed files:** `tests/keeper_shot_calibration_browser_qa.py`, `tests/keeper_live_ai_fairness.test.cjs`, this specialist handover, small `docs/NEXT_MILESTONES.md` checkpoint after CI.

## Bounded new requirement

Previous [keeper contact calibration](KEEPER_OUTCOME_COHORTS_20261016.md) ran real `freeBall/updateBall` physics and measured 144 seeded shots per browser context, but deliberately did **not** execute `updatePlayers` between ball ticks. It could not estimate the practical effects of goalkeeper AI positioning, fatigue and capped physical dive on real save/goal outcomes. The existing geometry-only 144 fixtures remain unchanged.

This feature adds a **separate live keeper-AI cohort inside the same browser suite**, with `g.updatePlayers(1/fps)` immediately followed by `g.updateBall(1/fps)` on every frame, without suppressing or substituting game AI. A temporary wrapper only **counts and delegates** `g.driveAI` calls, then restores the original method in `finally`. It uses a stable pseudo-random stream for independent repeatable cases, zero wind, mirrored teams, and parked outfielders to reduce unrelated interceptions.

The added cases cover **3 FPS values (30/60/120) × two defended ends × two keeper-fatigue levels (0/.75) × ordinary or nonlinear `zigzag` Super Shot × two near-corner aim lanes (85/132) × 2 identical seeded repetitions = 96 fixtures per browser context** and 48 unique conditions. Desktop and simulated-touch Chromium each run all 96 cases. The code reports real goals, saves, unresolved balls, keeper AI execution counts, keeper displacement and any mirror-side differences. Assertions prevent duplicate save notifications, goal-plus-save double attribution, outside-plane saves, wrong-sided events, missing AI calls and non-repeatable seeds. Mirrored outcome differences are *reported* rather than hidden or asserted fair without evidence.

**The playable game engine, player data/FC27 ratings, AI algorithms, goalie reach, ball velocity, input controls, save schemas and visual assets are unchanged.** This is a measurement and regression-coverage feature; passing it does not imply that an observed keeper success rate is balanced.

## Reproduce

```sh
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/keeper_live_ai_fairness.test.cjs
python3 tests/keeper_shot_calibration_browser_qa.py
node --test tests/*.test.cjs
python3 -m unittest discover -s tests -p test_parallel_data_merge.py -v
```

The existing `Full Regression Census` push trigger includes `tests/keeper_shot_calibration_browser_qa.py`, so a commit changing that suite runs both the original geometry and new live AI cohorts as part of its four Chromium shards. Hosted desktop and simulated-touch gameplay is verified independently at https://saeedsai.github.io/SuperMagicFootball/ . Physical iOS/Android, PWA/offline/restart and cross-platform multiplayer remain deferred.

## Initial known gaps and handover

The initial small goal is to ensure **real AI is exercised**, results are reproducible and save event invariants hold. Longer multi-seed AI vs human competitive balancing, nonlinear trajectory distributions, cross-device latency and per-club goalkeeper statistics require separate future evidence before changing goalkeeper gameplay. Never tune constants based on 48 controlled conditions alone.

No generated game fixtures, older seed tests, concept assets or historical QA reports should be deleted: they remain part of archived regression coverage. Build/cache artifacts are ignored, and cleanup must not touch another agent's files.

**Next five iterations:** (1) triage exact-source eight-shard census and measure any mirrored AI save/goal asymmetry; (2) targeted goalkeeper corner/warp/ricochet physical fairness changes *only if* backed by evidence and a fresh gameplay claim; (3) finish eight-direction keeper glove grip/distribution under a graphics lock; (4) improve passing/first-touch animation and source-aware player/graphics provenance in disjoint owned scopes; (5) enhance halftime/career coaching and physical-device/PWA offline acceptance, without changing existing saved games.

**Final code SHA, CI and host results:** to be appended after verification.


## Completed regression certification and real-AI outcome evidence

**Source integration:** existing monitored browser script updated in [`80c02e8c`](https://github.com/saeedsai/SuperMagicFootball/commit/80c02e8c4726900ff858d3e2202ba7c32a8e08c5); new Node regression bridge in [`37192dd1`](https://github.com/saeedsai/SuperMagicFootball/commit/37192dd1aa3d3827dd8da3642c46c2b03291f42e), specialist handover in [`b7c51643`](https://github.com/saeedsai/SuperMagicFootball/commit/b7c516437f04b526a68d70ace87197f9a14498fe). Concurrent CI/roster/graphics/UI commits were retained.

[**Full Regression Census #38903547925**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38903547925) **SUCCESS** on descendant SHA `f4cbf72baa50b73a706c05c38f479aa09486d94c`, containing the complete unchanged new keeper tests. Preflight roster/data validator, game fixture builder and active **118/118 Node contracts** passed. The four historical Node shards passed **118/118** (30+30+29+29); the four Chromium shards passed **63/63** (16+16+16+15). **Total 181/181 PASS, no failure, timeout, ERROR or NOT_RUN.** Archived test discovery remained intact. The actual keeper browser case ran in browser shard 0, **PASS in 3.81 seconds**.

The raw browser JSON artifact `full-regression-browser-0` for this exact run records the two independent devices:

| Metric | Desktop Chromium | Simulated mobile touch |
|---|---:|---:|
| Legacy ball-only contact cases / unique conditions | 144 / 72 | 144 / 72 |
| Legacy real keeper saves / goals / unresolved | 34 / 36 / 2 | 34 / 36 / 2 |
| Legacy duplicate save events | 0 | 0 |
| **Added live-AI cases / unique conditions** | **96 / 48** | **96 / 48** |
| Real live-AI saves | **26** | **26** |
| Actual goals | **10** | **10** |
| Unresolved attempts | **12** | **12** |
| Live-AI keeper calls in the unique cohort | 1,628 | 1,628 |
| Cases where keeper physically moved | 48 / 48 | 48 / 48 |
| Mirrored outcome mismatches | **0** | **0** |

**Interpretation:** The live-AI numbers use a different set of conditions than the original 72 ball-only ones; do **not** compare their raw proportions as proof that keeper AI makes saves more or less often. Two deterministic near-corner aim lanes and one zigzag Super behavior cannot establish all-skill-level or human-vs-CPU parity. Continue with broader sampled seeds, nonlinear behaviors, pressure, fatigue and club keeper attributes before proposing any movement or save tuning.

[**Deployed hosted game smoke #38891468528 — latest rerun**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **SUCCESS**: live public GitHub Pages **HTTP 200**, version `0.8.25.32-integrated`, **224 runtime teams**, menus, selection, kickoff and active gameplay on real desktop Chromium and simulated touch Chromium. This does not certify a physical Android/iPhone, Safari or installable PWA offline restart.

**Cleanup review:** latest tracked Git tree contains zero tracked `__pycache__`, `.pyc`, `node_modules`, `.generated`, `.tmp`, `.bak`, `.swp` or `.DS_Store` candidates. Historical QA and concept assets remain necessary, so no unrelated file deletions were made.

**Handover:** This small keeper-testing requirement is accepted. Once this report and roadmap checkpoint are pushed, release exclusive gameplay-engine ownership. Next owner must re-read claims and only then select real-AI multi-seed/trajectory balance tuning, if evidence requires it. No other agent's CI, graphics, UI, roster, gameplay settings or game-save files were modified.
