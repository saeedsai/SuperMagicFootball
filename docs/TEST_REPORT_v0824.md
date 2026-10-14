# Full regression and defect report — v0.8.24 Alpha

**Date:** 14 October 2026. This is actual test evidence, not projected coverage.

| Suite / check | Executed | Passed | Failed / timeout | Notes |
|---|---:|---:|---:|---|
| Full Node master runner | 58 | **58** | 0 | 57 npm scripts + 1 release master contract; `qa_runs/master_full_node_s0of1_v0824_final.json` |
| Full Chromium browser suite | 38 | **38** | 0 | Six sequential shards: **7+7+6+6+6+6**; `qa_runs/master_full_browser_s[0-5]of6_v0824_final.json` |
| Synthetic fixed-lane goalkeeper/shot matrix | 3,450 trials | Bounds PASS | 0 bound failures | 5 CPU difficulty presets x 2 goals x 3 keeper profiles x 5 shot cases x 23 lanes; NOT 3,450 distinct scripted test assertions |
| New desktop and simulated-touch browser goalkeeper regression | 2 device emulations | **2** | 0 | Included in the 38 browser scripts, not an extra two scripts |
| Seeded Node in-game performance sanity | 2,000 frames | PASS | 0 | 33.3 seconds simulation; wall time in `KEEPER_FAIRNESS_MATRIX_v0824.json`; not device FPS |
| Master catalog | 389 documented requirements | Not individually certified | N/A | Six new keeper cases added; a requirements count must not be reported as executed assertions |
| Real iPhone, Android, Safari, Firefox, physical gamepad/audio | 0 | Not run | N/A | Unavailable hardware/browser engines |
| Normal-origin browser storage reload | 0 | Blocked | N/A | Chromium navigation policy blocks HTTP/file; mocked storage regression PASS only |

## Confirmed fixes

1. Previous automatic rare goalkeeper ability rolled a new 14% chance on **every update frame** while transformed shot remained near a keeper. The cumulative chance was frame-rate dependent, contrary to intended rarity. Fix: one decision per eligible incoming transformed shot, from inside ability reach and close to the goal mouth. Ordinary saves still execute after failed/suppressed special attempt.
2. Keeper ground recovery was difficult to read in reduced-size cartoon rendering. Added a short visual-only fading landing contact ripple. Dive motion, GK attributes, cooldowns, and collisions remain unchanged.
3. New QA release exposed a packaging/test-runner defect (automatic `v08232` test filename rewritten as `v0824` even though the historic fixture was deliberately retained). Corrected `package.json` references and reran **all** Node scripts to passing status; no outstanding test harness failure.

## Interpreting the metrics

The 3,450 mirrored goalkeeper trials hold the keeper at a fixed lane to test collision fairness. They **do not** demonstrate that Rookie/Expert match AI save rates differ or that a given Super Shot has a specified probability to score in real gameplay. Nonlinear paths sometimes shift into a keeper's lane. Reported timing of the 2,000-frame benchmark is measured in Node on this machine and not portable mobile FPS. See `GOALKEEPER_FAIRNESS_SPEC_v0824.md` for data definitions and limitations.

## Scope/regression invariants

223 teams / 2,676 roster slots, including exactly six historical BPW World Cup squads and the seventh All-Time Legendary 12. Exactly four action buttons and six approved formations. Input buffers, grounded/aerial Super Shot, Super Header and Super Bicycle, save export, career, music and ambience remain regression covered by the full scripts.

## Outstanding

Physical phone/gamepad/audio tests, Safari/Firefox, normal-origin storage persistence, real keeper movement/difficulty study and low-end frame-time profiling. Full browser regression has passed **by six isolated shards**; a single uninterrupted run is not certified. No routine 2026 roster adjustments were made.
