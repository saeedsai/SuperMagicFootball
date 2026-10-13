# Supermagic Football v0.8.15 — Test & Regression Report

## Scope

Defensive AI selection, active pressing, close-range tackle attempts, GK nearest/long distribution, airborne and assisted transforming-shot trajectories, five CPU difficulty profiles, and all inherited match/career/roster/UI functionality.

## Final results

- **25/25 Node gameplay suites: PASS** (`npm test`). This includes 24 inherited suites plus `tests/active_pursuit_ground_shots.mjs`.
- **19/19 inherited browser QA scripts: PASS**, executed in four separate serial batches to avoid earlier runner timeouts. Desktop and simulated Android where each suite supports both.
- **6/6 additional browser scripts: PASS**: new active-pursuit browser test, character-art QA, offline cartoon identity QA, secondary controls, roster screen and fullscreen/legacy-save QA. The new test uses both desktop and simulated Android Chromium.
- **Portable single-file HTML build: PASS** (`npm run build`).

## Targeted acceptance checks

1. AI teammate selected from AI-controlled players even when a human teammate is closest.
2. CPU opponent pursues the human ball carrier in the same frame despite a long previous AI think timer.
3. Closest CPU presser attempts a tackle when within contact radius.
4. Jumping transformed shot retains metadata and travels toward the goal with a downward vertical component.
5. Assisted aerial super also descends, while ordinary flip-kick mechanics retain loft.
6. Goalkeeper PASS targets nearest eligible teammate; SHOOT punts toward most advanced teammate.
7. All five AI levels retain different movement speeds and goalkeeper reaction times.
8. Old save data still imports and newly exported saves use the current product/version tag.

## Test maintenance

The old `ai_difficulty.mjs` measured signed x movement toward a stale synthetic target. Since pressing now dynamically changes the direction, it measures **absolute movement distance**; goalkeeper reaction delay remains a separate assertion. `defensive_pursuit_pitch.mjs` now isolates human pursuit controls from independent CPU actions, while the new targeted suite covers AI behavior explicitly. The original full Node suite passed after these changes.

## Still unverified

Physical Android/iOS phones, Bluetooth/USB gamepads, Safari/Firefox, long-session AI balance, full football rules, exact Nintendo move-parity and the **planned five-tier special ability system**. Passing regression tests does not certify these as complete.

## Final package verification

- The final standalone `play.html` was regenerated after all gameplay and version edits, then copied to `Supermagic_Football_v0.8.15_Play.html`.
- The source package includes the full editable project, updated living roadmap, canonical 216-item matrix, dedicated and inherited tests, plus desktop/simulated-mobile screenshots.
- `unzip -t Supermagic_Football_v0.8.15_Source.zip`: **passed, no corrupt files**.
- Final Node regression log: `tests/REGRESSION_NODE_FINAL_v0815.log`.
- Final standalone build log: `tests/BUILD_FINAL_v0815.log`.
- Final focused browser QA log: `tests/ACTIVE_BROWSER_FINAL_v0815.log`.
