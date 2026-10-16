# Keeper single-save event regression — 16 October 2026

## Scope and baseline

- `dev` base commit: `53299d7e3b71557062fe74b6a06822769957ea93`.
- Focused game fix: avoid re-collecting a successfully caught keeper dive in the same `updateBall` frame; protects its actual `keeperDiveCatch` pose.
- No changes to contact plane/depth, goalkeeper movement, shots, rules, squads, art source, controls, persistence or player IDs.
- Existing deterministic real-engine `keeper_shot_calibration_browser_qa.py` runs 144 seeded fixtures per Chromium viewport (desktop and simulated mobile/touch), with mirrored directions, 30/60/120Hz, normal/Super Shots, three lanes, two fatigue bands and repeats. Added a hard assertion that `rawSaveEvents <= 1` per shot.

## Acceptance gates and evidence

1. `python3 scripts/validate_data.py` and `python3 scripts/build.py`: **awaiting exact-commit CI**.
2. `node --test tests/*.test.cjs`: **awaiting exact-commit CI**.
3. `python3 tests/keeper_shot_calibration_browser_qa.py`: **awaiting full-regression browser shard**.
4. `Full Regression Census`: **awaiting exact-commit CI**.
5. GitHub Pages production deployment and hosted PC/touch kickoff: **verify independently; do not infer from a successful git push**.

## Remaining gaps

Actual long-term keeper save rates under realistic match pressure, new Super Shot behaviors and player-controlled keeper holding remain uncalibrated. Other agents own 2026/27 team/player data and concept art. Physical-device and PWA certification remain deferred. No deletion of historical test artifacts, which are still referenced in CI.
