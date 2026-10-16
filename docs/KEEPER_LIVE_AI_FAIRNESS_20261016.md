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
