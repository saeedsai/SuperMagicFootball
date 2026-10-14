# v0.8.24.4 Alpha test report — 14 October 2026

## Verified
- Node full suite: **62/62 script-level PASS**, including release contracts, BPW teams, four-button controls, Super Attack, goalkeeper, audio and new extended match matrix. See `qa_runs/master_full_node_s0of1_v08244_final2.json`.
- New seeded full-engine matrix: **15/15 match fixtures completed**, 3 match pairings × 5 difficulty settings, 60 seconds/half. Total goals by difficulty: 1, 1, 1, 1, 0; total saves: 33, 41, 37, 28, 33. Four goals across 15 matches is statistically insufficient for goalkeeper balancing. See `KEEPER_MATCH_MATRIX_v08244.json`.
- Standalone HTML rebuilt from live source.

## Not certified
- Full Chromium regression: concurrent six-shard run exceeded execution window; early scripts included failures (tactics and save-filter), while other scripts passed. Full set of 38 **NOT certified**. See `BROWSER_REGRESSION_STATUS_v08244.json`; unrun and interrupted scripts must not be counted as passes. Browser runs may suffer resource contention, but these failures require isolated reruns to distinguish harness from gameplay faults.
- Device/browser-origin audio and physical controller tests: not run.

## Fixes and constraints
- Fixed stale package/main version, PWA cache identifier and QA contract expectations.
- No goalkeeper mechanics retuning on the basis of limited scoring samples.
- No roster corrections; no early Super Defense/Tricks implementation.
