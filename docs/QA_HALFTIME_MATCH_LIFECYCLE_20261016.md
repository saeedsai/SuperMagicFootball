# Half-time match lifecycle mechanics — independent executable QA

**Feature:** `QA-HALFTIME-MATCH-LIFECYCLE` · **owner:** `qa-match-halftime-20261016-gpt6-session12` · **Date:** 16 October 2026. Exclusive claim: `qa-framework`. No production engine or UI edits.

## Gameplay requirement

Verify the shipped **in-match** first-half expiry and half-time recovery system:
- Ends first half only on the intended legal timing path, advances to half 2 with clock reset, pauses play and opens the actual half-time menu.
- Recovers exactly 40% of accumulated fatigue on field **and on bench**, for each side, while clearing stun.
- Retains rosters/player IDs, scoreboard, existing saved plans, and eligible one-time team-talk behavior. CPU halftime substitution may legitimately change away lineup.
- Resumes the real second half with the existing four buttons, then transitions to full time with the score intact and no duplicate manager talk.

## Delivered isolated tests

`tests/halftime_match_lifecycle.test.cjs`: five Node contracts execute **the actual extracted `GameEngine.halftimeRecovery` method** from `src/modules/engine.js` under a controlled fixture, testing both teams' exact recovery, bench, stun, noninterference and live update ordering. No copied alternative fatigue formula.

`tests/halftime_match_lifecycle_browser_qa.py`: actual modular quick-match UI + `GameEngine.update` in desktop and simulated-touch Chromium. Seeds isolated match fatigue, crosses the real clock threshold, verifies game and UI, consumes a one-time talk, resumes and tests full time. An isolated benchmark; no game engine, input logic, visuals, save schema, player data or menu controls change.

The input/dribble-touch issue [#3](https://github.com/saeedsai/SuperMagicFootball/issues/3) is concurrently owned by `ui-controls`. Goalkeeper live-AI calibration remains owned by `gameplay-engine`; graphics are also active. The QA source files here are independent. No historical art, snapshots or older tests were deleted because those are not demonstrably stale.

## Release/testing checklist

1. New tests passing in exact-source Modular Game Dev QA (Node discovery) and complete 4 Node+4 Chromium Full Regression Census (browser discovery).
2. Confirm the **specific** new browser script executed and passed, not merely that source compiled.
3. GitHub Pages installed and live desktop + simulated touch smoke pass. Physical iPhone/Android and offline upgrade require future acceptance.
4. Commit/source SHAs, CI and failures recorded below, release the claim and handover before continuing.

## Next five small iterations

1. Certify these match lifecycle tests and fix only isolated QA fixture mistakes.
2. After gameplay-engine ownership becomes available, address proved keeper real-shot balance/contact failures with deterministic seed cohorts.
3. Close touch rainbow-dribble reliability issue #3 under its current input owner, preserving four-action semantics.
4. Finish eight-direction goalkeeper ball hold/release and directional pass/first-touch animations under graphics ownership.
5. Deliver a save-compatible gameplay option or career progression mechanic after a new exclusive engine or UI claim; test desktop/touch and persistence.

**Release evidence and result:** append after exact commit and CI.
