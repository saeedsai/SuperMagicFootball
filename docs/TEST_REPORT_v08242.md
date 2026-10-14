# Supermagic Football v0.8.24.2 — release QA report

## Completed verification
- Full inherited + updated Node script suite: **60/60 PASS** (`master_full_node_s0of1_release2.json`).
- Full Chromium desktop / simulated-touch regression: **38/38 PASS**, verified across six completed shards. Files: `master_full_browser_s0of6_release2.json`, `s1of6_release2.json`, `s2of6_bounded.json`, `s3of6_bounded.json`, `s4of6_final.json`, `s5of6_final.json` (all prefixed `master_full_browser_`).
- New `v08242_keeper_tracking.mjs`: **120 deterministic fixtures PASS**, five difficulties × both goals × three fatigue states × four shot types. Existing v0.8.24.1 keeper fixtures: 96 PASS.
- Master release contract: PASS. Standalone HTML build and ZIP hash/CRC verification: PASS.
- QA catalog: **398 documented cases**, NOT 398 individually executed tests.

## Issues discovered and disposition
- Outdated test-runner filename introduced in this release preparation: fixed; reran full Node suite 60/60 PASS.
- Initially intermittent aerial Chromium assertion during heavily concurrent browser runs: standalone rerun and final bounded shard both PASS. No gameplay defect proven; test timing remains worth monitoring.
- Long chained browser runs hit the local execution limit. All tests subsequently completed in separate bounded shards; these individual final results are the certification evidence.

## Remaining known gaps
- Controlled 120-case forecast matrix does not demonstrate realistic **end-to-end moving-goalkeeper goal/save rates** or CPU difficulty fairness in actual play. Requires seeded live-match scoring distributions and human trials; do not claim gameplay rebalance.
- Physical mobile/gamepad, Safari/Firefox, ordinary browser-origin localStorage persistence, Bluetooth latency and mobile performance remain unverified.
- Star/Superstar Super Defense and Tricks remain deferred. Routine modern roster corrections remain postponed.
