# Manager Career — pre-match bench readiness and reserve recommendations

**Date:** 18 October 2026  
**Feature / lock:** `UI-CAREER-BENCH-READINESS` / `ui-controls`  
**Agent:** `gameplay-review-20261018-gpt6-career-bench-r8`

## Problem and delivered feature

The previous opponent scout warned that a career squad contained low-fitness or injured players, but offered **no actionable positional replacement** before the next fixture. In the existing Manager Career **NEXT OPPONENT SCOUT**, the new **BENCH READINESS** section:

- Uses the current saved home-club six-player plan via `planFor(c.club).lineup` and the live twelve-player `career.roster`. A fully fit starting six yields a positive readiness message with no invented substitute.
- Identifies the **injured first**, then starters below **60%** fitness, never a healthy starter or a merely fatigued reserve.
- Suggests a bench player in the **same actual role** (GK → GK, DF → DF, etc.) who is not already a starter, not injured and at least 60% fit. Ranks candidates by fitness, then positional OVR, then original squad index. Each proposed reserve is used at most once.
- Reports **no healthy same-position reserve** when no valid bench alternative exists. Shows at most three detailed starter warnings and counts any additional players.
- Escapes dynamic player names and roles, avoids writing plan/lineup/save/economy, does not add a new match action, and links naturally to the existing **12-PLAYER SQUAD** and tactical management choices.
- Reports advice only. The existing Career Match launch remains unchanged; injuries are *not* silently auto-replaced.

This is an entirely bounded UI enhancement. No engine physics, transfer economy, team or player identities, World/Club datasets, input mappings, artwork or save schema were changed.

## Source and tests

| Artifact | Purpose |
|---|---|
| `src/modules/ui.js` | New pure `careerBenchReadinessPanel(c)` helper embedded inside the existing read-only opponent scouting report |
| `tests/career_bench_readiness.test.cjs` | 11 real-source helper tests for healthy, injury, role matching, no unavailable reserve, no starter reuse, unique recommendations, priority, invalid input, HTML escaping, side-effect freedom and 3-row limit |
| `tests/career_bench_readiness_browser_qa.py` | Real Manager Career and live match on desktop and simulated-touch Chromium; healthy and injured goalkeeper scenario; protected twelve-player squad IDs, game plans, score, four-button action layout and saved career |
| `tests/career_opponent_scout.test.cjs` | Minimal compatibility update to its existing standalone VM source extractor so a second independent helper can be declared after the original without breaking legacy six-case coverage |
| This handover, `docs/NEXT_MILESTONES.md`, this chat's own memory | Small checkpoint and next work |

## QA and known integration risks

- [UI change `3319e264`](https://github.com/saeedsai/SuperMagicFootball/commit/3319e2648958abc6243ff32fafc2bcad1fe813f5).
- [11 Node cases `853dcd13`](https://github.com/saeedsai/SuperMagicFootball/commit/853dcd13b49ee6e9a4bc65628a82ac62698a57cb).
- [Browser test `7cf85e15`](https://github.com/saeedsai/SuperMagicFootball/commit/7cf85e15572041c7b8351101eeb8aee2fd0e30f6).
- Initial Node source extractor error `helper is not a function` was **our test harness** and corrected in [`9d437ed1`](https://github.com/saeedsai/SuperMagicFootball/commit/9d437ed172027c4cc2b1ac2f9851831a35b5101d). The older opponent-scout test needed a precise old-function boundary, updated in [`90cf1058`](https://github.com/saeedsai/SuperMagicFootball/commit/90cf1058bd73654f5241d911bfb28d0f84225a0c) and the trailing-comment delimiter fixed in [`c179b69f`](https://github.com/saeedsai/SuperMagicFootball/commit/c179b69fd5175df5fbbfefc4662da52b238fab98).
- Concurrent concept-graphics C01 front face/collar commits caused two independent `tests/concept_modular_v1.test.cjs` **test expectation mismatches** in the initial combined Node runs. These belong to a **separate graphics-renderer owner**; do not edit unrelated artwork/tests. Review the latest full regression before claiming they persist.
- Current original baseline [full census #39027099446](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39027099446) was completely green before this feature; it **cannot** certify the new code. Confirm next source-descendant full census, browser test and exact Pages workflow; report missing evidence explicitly.

Local commands, if source checkout is available:

```sh
node --test tests/career_bench_readiness.test.cjs tests/career_opponent_scout.test.cjs tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs
node --test tests/*.test.cjs
python3 scripts/build.py
python3 tests/career_bench_readiness_browser_qa.py
# GitHub Actions: Full Regression Census (4 Node + 4 Chromium), hosted PC/touch smoke
```

The About screen retains its GitHub `dev` SHA fetch per commit, separate from bundle version `0.8.25.32-integrated`; no release-infra or About code was edited. Physical Android/iOS devices were not available in this session.

## Cleanup and next five iterations

No tracked build-cache folders, generated Playwright screenshots or test fixture HTML were intentionally added. Historical artwork and QA provenance are retained unless a dependency audit proves any file obsolete.

1. Certify exact-code Node + desktop/simulated-touch Chromium and feature-containing GitHub Pages, resolving the independent C01 concept-art tests in its own claim.
2. Explore safe manager squad lineup selection for replacements before kickoff, with opt-in user approval and save-schema invariants.
3. Calibrate goalkeeper save/clear and first-touch press under distinct engine ownership and seeded tests.
4. Fix rapid mobile double-tap rainbow dribble issue #3 if reproducible on current Android or emulation.
5. Continue classic competitions, offline PWA, physical device reliability and remote multiplayer as separately claimed features.

## Confirmed feature browser acceptance and integrated CI results (18 October 2026)

- [Modular QA #39106052005](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106052005) on descendant source `fe4e203640`: **283/283 Node PASS**, including all eleven new career bench tests, original opponent scouting regression and About version checks. [Modular QA #39106213662](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106213662) later completed **SUCCESS** with further concurrently added source.
- [Full Census #39106016620](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106016620) on exact post-fix descendant `c179b69f`: **preflight PASS, all 4 Node shards PASS, browser 84 PASS / 1 FAIL**. Our `career_bench_readiness_browser_qa.py` explicitly **PASS 4.36s** in browser shard 0, exercising **both desktop and simulated-touch Chromium**, real career creation, injured starting GK, same-position reserve, repeated non-mutating advice and live kickoff.
- [Later Full Census #39106045586](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106045586) reproduced **the same independent failure**: our bench acceptance again **PASS 3.33s**, all four Node shards green, 84/85 browser scripts green. The red script is `keeper_roll_distribution_browser_qa.py` in browser shard 1 (`blocked:false` on a rolled pass that emitted both `keeperDistribution` and `passIntent`). The `gameplay-engine` lock belongs to the separate quick keeper-roll implementation agent. We created [issue #38](https://github.com/saeedsai/SuperMagicFootball/issues/38) for that owner to reproduce/fix without modifying unowned game code or weakening validation.
- Latest in-flight full census [#39106207590](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106207590) had green preflight and all 4 Node shards, browser still executing when checked. Do not infer its final outcome.
- Physical Android/iOS handsets **not tested**. GitHub Pages deployment must be confirmed to contain a descendant of commit `3319e264` before claiming the public hosted build includes this new panel. The ordinary public webpage reader could not load the interactive GitHub Pages game.

## Published build ancestry and cleanup verification

[GitHub Pages deployment #39105994538](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39105994538) completed **SUCCESS** at `d1187f8ec`; GitHub compare confirms this commit is a **28-commit descendant** of the game feature source `3319e2648958abc6243ff32fafc2bcad1fe813f5`. Thus GitHub Pages published a revision containing the new read-only bench panel. This is deployment evidence, **not** a standalone physical phone or hosted real-time click-through test; the external page reader could not access the site. The new manager interaction **was** exercised in the exact modular Chromium desktop + simulated-touch regression.

Repository tree audit on the latest active `dev`: **748 tracked paths**, none matching build caches/temp paths such as `node_modules`, `__pycache__`, `.generated`, `dist`, `coverage`, `playwright-report`, `test-results`, `.pyc`, `.bak` or `.tmp`. All added test files and source paths are present. No art/roster or historical document was removed without dependency proof. The About screen still dynamically identifies current online GitHub `dev` commits, distinct from its game-bundle release version.
