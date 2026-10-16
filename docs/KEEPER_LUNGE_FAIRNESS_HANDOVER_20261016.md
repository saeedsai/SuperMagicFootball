# GK-LUNGE-FAIRNESS — keeper AI tracking and bounded-dive QA
Date: 2026-10-16. Exclusive lock: `gameplay-engine`; owner: `gameplay-keeper-lunge-fairness-20261016-session4-gpt6`.
Claim: [gameplay-engine.json](agent_coordination/claims/gameplay-engine.json).

## Narrow observed defect and implemented requirement
An earlier iteration introduced `advanceKeeperDive(p,dt)`, which caps the keeper's *extra* anticipatory lateral movement to 28 world units at maximum, reduced by GK Diving/fatigue. But during that same intent window, the AI controller `driveAI` also used `moveAgile` toward a stale positioning target. Both movements stacked, allowing the *actual* keeper to exceed the stated cap and making scoring corners less fair.

In the playable `src/modules/engine.js`, `driveAI` now returns early when **keeper + diveIntentPending + keeperDive**. It clears AI movement velocity, so normal tracking cannot move them in addition to their legitimate `advanceKeeperDive` displacement. During the short committed-dive phase, **only the existing bounded physical lunge** moves the keeper. Normal AI resumes when the intent ends. This does not modify the ball, goalkeeper contact X-depth, swept saves, Super Shot velocity/ability, manual player control, goal geometry, or roster/graphics data.

## New dedicated tests
1. `tests/keeper_ai_lunge_guard.test.cjs`: verifies the AI guard occurs before target planning and `moveAgile`, zeroes stale inertia, and retains the original 28-unit lunge and narrow contact depth.
2. `tests/keeper_ai_lunge_guard_browser_qa.py`: real modular engine, not a mocked/stubbed `driveAI`. Each desktop and simulated-touch browser tests 3 FPS (30/60/120) × 2 defended sides × 2 fatigue levels = **12 cases per device, 24 total**, with a deliberately stale target and existing movement velocity. Acceptance: physical keeper movement is positive, capped and identical to `diveAdvanceTravel`; mirror cases agree; tired keeper travels less; no ball change/save/contact before the flight frame; no added motion after shot turns away; AI resumes after the intent.
3. Inherited seeded/keeper/shot/gamepad/graphics/roster tests remain part of `Full Regression Census`. The workflow auto-discovers new `*_browser_qa.py` and `*.test.cjs`; we do **not** edit another agent's QA runner or CI/release workflow.

## Validation checklist and handover
- Claim ownership confirmed from live GitHub before editing, including pre-protocol keeper handover.
- Base: refreshed `dev` after graphics agents' concurrent commits. Only gameplay engine, new two keeper tests, this document and next-milestones addendum edited.
- Targeted Node suite and full Node/Python + Chromium regression: exact-commit CI results should be added below after completion, **not** inherited from the green 156/156 earlier release.
- Publish Pages deployment and hosted PC/simulated-touch interactive smoke results separately. Do not mistake deployment for a physical-device certification.
- If one inherited unrelated browser test fails nondeterministically, document it and rerun only the failed job; do not hide a failed script.
- No tracked files deleted. Historical QA logs, generated test fixtures, art assets and other agents' records remain deliberately untouched.

## Release and next five small increments
1. Interpret actual shot-level keeper saves/corner fairness with real AI enabled at different FPS, fatigue and nonlinear Super variants; modify only one factor if reproducible outcomes warrant it.
2. Owner-coordinated eight-direction goalkeeper glove/grip/throw artwork without changing possession physics.
3. First-touch / directional pass animation transitions, preserving controls.
4. Provenance-aware roster and graphics editor review, source-to-preset referential checks.
5. Career/tactics substitution feedback and lineup-position suitability, preserving saved-game keys.

Other major open requirements: classic-mode parity, complete player authenticity, physical iOS/Android, PWA/restart QA, rare Super Defense/Tricks and multiplayer. Do not modify art/roster/UI release infrastructure under this lock.

## Exact-commit results
Pending final workflow results; read GitHub Actions run and its eight shard logs before certifying this batch.

### CI and hosted-game evidence collected during integration

- **Exact gameplay+test source checkpoint:** [`c0e7132fd4c0e42ac16425d7ba55365c5c717a68`](https://github.com/saeedsai/SuperMagicFootball/commit/c0e7132fd4c0e42ac16425d7ba55365c5c717a68). Its [Full Regression Census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468584) passed preflight and all four Node shards: **104/104 Node executable test scripts PASS** (26 each), including the new keeper movement guard. Browser shards were still running at this intermediate checkpoint; their outcome is separately recorded after completion rather than assumed.
- [GitHub Pages hosted PC and simulated-touch verification](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **SUCCESS**: both HTTP 200, menu navigation, team selection, kickoff, extended pitch geometry and active match. Runtime reported 224 teams and version 0.8.25.32-integrated. This hosted smoke does not claim physical phone hardware.
- Runtime change is bounded to early-dive goalkeeper AI movement, not the server, service worker, art pipeline, save keys or roster. Any other agent's subsequent `dev` commit requires its own exact-commit checks and cannot inherit a green result by assumption.
