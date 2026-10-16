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

## Subsequent verified results and outstanding regression (checkpoint)

- [Keeper Save Event Integrity #38885906247](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885906247) **SUCCESS**: actual modular-game fixture build, Node contract check, 18 headless desktop and 18 simulated-touch keeper shot/deflection/loose-ball fixtures across 30/60/120 Hz. This validates the adjacent, concurrently implemented loose-ball save classification fix.
- [Full Regression Census #38885583752](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885583752) originally completed **FAILURE** despite preflight, four Node shards and three Chromium shards passing. The remaining Chromium shard passed 12 of 13 suites; `dribble_styles_browser_qa.py` failed the simulated Android double-tap input acceptance (`events=[]`, `ballOwner=false`), unrelated to keeper changes. Crucially, `keeper_shot_calibration_browser_qa.py` **PASSED** on this regression run, including the new raw duplicate-save assertion. A targeted re-run was requested on the failed job; its completion must be checked before claiming the full census green.
- The deployed desktop/touch smoke passed as linked above; this tests simulated touch in Chromium, **not** physical Android/iOS hardware.

**Final classification at checkpoint:** keeper fix and keeper test ACCEPTED in targeted browser/Node QA; general release regression NOT YET FULLY GREEN due inherited mobile dribble touch check; preserve the work on `dev` and continue with the failed-shard rerun before other behavior changes.
