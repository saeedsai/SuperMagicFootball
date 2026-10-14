# Supermagic Football — v0.8.24.6 Alpha QA report
**Date:** 14 October 2026. All figures below are actual completed checks on the corresponding build; unexecuted acceptance requirements are not counted as passing.

## Final regressions
- **Node: 64/64 executable scripts PASS**, no fails/timeouts. Machine evidence: `qa_runs/master_full_node_s0of1_v08246release_final.json`.
- **Chromium: 38/38 distinct browser scripts PASS** on v0.8.24.6 after rerunning the affected shard (six full sequential shards). Includes desktop, simulated Android/touch, formation/team choices, 6+1 BPW teams, Super Attack input, audio, tactics and save import/export. Machine evidence: `qa_runs/master_full_browser_s{0..5}of6_*.json`; corrected shard three is `qa_runs/master_full_browser_s3of6_v08246final_fixed_s3.json`.
- **Three new release QA acceptance entries**, 405 total documented requirements, of which only the three new entries have individually evidenced fixtures this iteration. The requirements catalog total is not the number of tests actually executed.
- **CPU policy fixture: 15/15 scenarios PASS** (0, 1, 2 humans × five difficulty requests). The five user-facing solo-CPU shooting profiles have distinct ordered deterministic target offsets.
- Standalone `play.html` rebuilt from current source; release version/PWA cache/exported saves aligned.

## Failed run investigated and repaired
Initial v0.8.24.6 Chromium group 3 had **5 PASS, 1 FAIL**: `four_button_phase2_browser_qa.py` on simulated Android sometimes checked for a flying-kick event after releasing a gesture, with an unstable state inherited from the preceding bicycle action. The desktop half passed. A failure report remains preserved as evidence.

Repaired the browser test setup by clearing stale jump count/airborne state, explicitly preventing unrelated rare defense activations, and keeping the touch chord active until the expected event is observed. This preserves the intended four-button combination and detects a real failure rather than asserting on a race. Three separate desktop/Android reruns then passed. Full shard three subsequently passed **6/6**, making the final unique browser coverage **38/38 PASS**. No gameplay mechanic was adjusted on evidence of this test harness race.

## Material calibration finding and correction
Older v0.8.24.3/24.4 full-engine AI-vs-AI matches were grouped by requested difficulty, but `GameEngine.cpuLevel()` intentionally returns Normal for both teams when `humans=0`. Comparing their saved/goals values as a difficulty curve was **methodologically invalid**. Regenerated the 15-match JSON at `KEEPER_MATCH_MATRIX_v08246.json` with effective difficulty fields and `calibrationValidForCpuDifficultyComparison:false`. New `v08246_cpu_difficulty_scope.mjs` asserts game mode policy and distinct solo-CPU shot aims. The data still do NOT establish real-match fairness; keeper/shot physics unchanged.

## Outstanding validation
- Matched player-vs-CPU games with sufficiently varied attacking input and enough samples to estimate shot quality, scoring, misses, rebounds and GK saves at all five difficulty levels.
- Physical mobile and real controller response/latency; Safari/Firefox, normal-origin audio settings persistence, low-end performance.
- v0.8.25 BPW original character visual identities/celebrations; future deferred Star/Superstar Super Defense & Tricks. Routine 2026 roster corrections remain postponed.

The full executed script manifest, browser rerun evidence and regression statuses are retained in `docs/qa_runs/` and JSON report. No unrun browser scripts are represented as passing.
