# Halftime coach: contextual, read-only second-half guidance

**Feature:** `UI-HALFTIME-COACH` · **Ownership:** `ui-controls` · **Session:** `ui-halftime-coach-20261016-1355-gpt6b`  
**Base `dev` before claim:** `d0cd38cc544d6d86be3a9f2a37236d01652ec925` · **Date:** 16 October 2026

## Requirement and implemented scope

The existing **HALF TIME** screen displays accessible **HOME COACHING NOTES** (plus **AWAY COACHING NOTES** for local two-player matches). The suggestions derive only from current score, on-field starting players' fatigue ledger, each team's remaining substitution quota and team morale. The guidance distinguishes trailing, level and leading scorelines, highlights any starter below 40% fitness, identifies exhausted substitution quotas, and cautions when morale is low. It names existing **Direct**, **Possession**, **High Press** and **Deep Block** tactics.

All notes are **advisory**. No team-talk selection is changed, no team plan is saved, no player is substituted, no match physics/AI or graphics are changed, and no stored save key is added. The existing four action buttons, lineup selections, six formations and halftime interaction remain intact.

## Acceptance tests

- `node --test tests/halftime_coach_advice.test.cjs`: trailing/leading/tie, both teams, fatigue threshold, substituted players, no mutation and DOM integration contract.
- `python3 scripts/build.py && python3 tests/halftime_coach_browser_qa.py`: real modular game Quick Match to halftime in desktop Chromium and simulated mobile touch. Tests actual advice, score/fitness/morale/remaining-subs cases, existing team-talk controls, unchanged team plans/save and return to second-half play.
- `node --test tests/*.test.cjs`, `python3 scripts/validate_data.py`, **Full Regression Census** 4 Node + 4 browser shards and GitHub-hosted desktop/touch Pages smoke are required for certification. **Never label queued/cancelled or inherited CI runs PASS**.

## Risk, ownership and cleanup

Work is limited to `src/modules/ui.js`, the two dedicated tests, `docs/NEXT_MILESTONES.md` addendum and this handover. No shared test-runner/CI workflow changes are needed: `src/modules/ui.js` already triggers the full regression workflow. Other agents independently own concept graphics and an Inter Milan roster metadata batch. No historical tests, images, QA logs or source data are removed: their use cannot be disproved and deletion would violate claims.

## Next five small iterations (after this checkpoint)

1. Finish exact-commit halftime Node/Chromium regression, classify/fix any failure in owned scope, certify hosted game.
2. Improve real-match goalkeeper corner and nonlinear Super Shot fairness with seeded, measured evidence.
3. Add editable eight-direction goalkeeper glove hold/release artwork and actual visual acceptance in a separate graphics claim.
4. Add directional pass/reception motion and parallel-source provenance validation, each under their own non-overlapping scopes.
5. Extend career tactical coaching and fitness/substitution accessibility, preserving existing saves and four controls.

## Handover and release gates

Record source SHA, new test evidence, full-regression run URL and actual browser outcome before releasing claim. If CI is not finished, leave it pending and release with a precise follow-up. No automatic takeover of occupied locks.

## Accessibility and restarted regression checkpoint

Follow-up UI polish adds `aria-live="polite"` on the home/away read-only coaching panels. The real desktop/touch acceptance now asserts that accessibility contract without changing player state. Full regression #38897704140 on preceding combined graphics/telemetry commit `cb3e1eee` was **blocked at preflight by an unrelated telemetry threshold test**; none of its browser shards executed. Independently, a newer descendant [Modular Game Dev QA #38897728842](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38897728842) passed **95/95 active Node tests** including five new halftime contracts, 17/17 merge tests and 8/8 claim protocol tests. The new UI-only accessibility edit re-triggers Full Regression Census on the newly integrated source; its result must be checked before certification.
