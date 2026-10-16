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

## Verified CI and live browser checkpoint

- Initial integration commit [7677110](https://github.com/saeedsai/SuperMagicFootball/commit/7677110b973ae0eae38c69680e13b60b045c4936) was pushed to `dev`; subsequent agents' commits retained the ownership guard and seeded one-save assertion.
- [Initial Modular QA #38885547226](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885547226) and [initial Full Regression #38885547443](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885547443) both failed at the inherited `keeper_dive_intent.test.cjs` static-method slicing check after another agent added the physical lunge. The unrelated test's parsing boundary was corrected by the following integration commit `d5433022`.
- On integrated `d5433022`, [Modular Game Dev QA #38885583606](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885583606) **passed**; the [Full Regression Census #38885583752](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885583752) **passed preflight plus all four Node shards**. Chromium shards were still running when this checkpoint was written; do **not** claim full census green until they finish.
- [Live deployed browser check #38885547363](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885547363) **passed** on desktop and simulated touch after the integrated Pages deployment: HTTP 200, 224 teams, navigated Quick Match, kickoff and active game, with correct expanded pitch. [Later smoke #38885745096](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885745096) also succeeded.
- Concurrent concept-character art changes subsequently caused separate graphics contract failures in full preflight. The other gameplay agent added a complementary loose-ball/save event classification guard and focused tests via [Keeper Save Event Integrity workflow](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/keeper-save-integrity.yml), without overriding this iteration's same-frame catch guard. The complete newly integrated regression remains a **release acceptance gap** until art and browser checks are green on one exact commit.

**Checkpoint policy:** Preserve historic art, roster and test artifacts referenced by CI; do not delete other agents' files simply to reduce repo size. The next session should check the latest `dev` SHA, both keeper-focused browser workflows and current full census, resolve failures in the owning workstream, then record exact pass/fail counts. Physical phone testing and offline/PWA remain deferred; simulated mobile touch is not a physical-device certification.
