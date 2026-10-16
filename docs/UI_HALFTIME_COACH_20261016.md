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

## Final code delivery and regression checkpoint

- Feature source commit: [`0b0739a0`](https://github.com/saeedsai/SuperMagicFootball/commit/0b0739a0ecc0bd7de665c8da231650af40893423). Accessible `aria-live=polite` + browser assertion follow-up: [`d43258b6`](https://github.com/saeedsai/SuperMagicFootball/commit/d43258b67899f281f82282ad53578f5ef2584c96). Both are preserved in later descendant `dev`.
- **Modular Game Dev QA [#38898008726](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898008726)** on exact `d43258b6` **SUCCESS**: **95/95 active Node subtests PASS** (including all five new halftime contracts), 0 fail, **17/17 Python merge tests** and **8/8 feature-claim protocol tests**; current data/asset/build validation also passed.
- An earlier full census [#38897704140](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38897704140) failed preflight on another agent's transient `match_telemetry` threshold assertion, and its Chromium shards were skipped. The same preceding active-QA failures occurred on earlier non-UI commits during graphics/telemetry packaging integration; newer `dev` active QA is green. Do not attribute those source-integration failures to the halftime advisor or mislabel that run as PASS.
- Later shared full census [#38897958209](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38897958209) has **preflight and all four Node shards PASS**, with four Chromium shards running at the documentation checkpoint. The feature's exact-source post-accessibility run [#38898008498](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898008498) was **pending**. Await a completed same-source browser run before overall release QA certification.
- Hosted GitHub Pages: [Play SuperMagic Football](https://saeedsai.github.io/SuperMagicFootball/). Later descendant [Pages deployment #38897889950](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38897889950) succeeded; a fresh [live desktop/touch Quick Match smoke #38891468528 (attempt 3)](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) was **running** at this checkpoint. Historic hosted desktop/touch verification was green, but do not claim this new attempt passed before completion or that a physical handset was tested.
- Branch sync: refreshed the live `dev` tree before both multi-file commits; no force push. All changes confined to `ui-controls` scope. Graphics, keeper telemetry, roster source files and release workflows were not edited. Existing ignored transient build files and historical QA material were preserved; no unrelated deletion was safe.
- **Known gap:** exact post-accessibility Chromium result, hosted smoke attempt 3 and physical Android/iOS certification remain unverified until their evidence completes.

### Next-session first action

Check whether [#38898008498](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898008498) and [hosted smoke attempt 3](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) finished. Inspect named failing scripts if needed; obtain a **fresh** claim before editing. Keep the five planned future batches above unchanged, with goalkeeper balance/artwork handled by their own owners.

## Browser assertion diagnosis and isolated fixture correction

The [combined census #38897958209](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38897958209) found a **test-fixture setup defect** in `halftime_coach_browser_qa.py`: it changed `game.players[].morale` while the production `teamMorale()` correctly reads `game.moraleLedger`, and modified fatigue across separate browser evaluations while the active frame loop could refresh `game.fatigueLedger`. It correctly detected the mismatch and failed instead of falsely passing. The fixture now freezes game updates, seeds **both authoritative ledgers**, checks its preconditions, and opens the actual halftime menu synchronously in the same browser evaluation. The UI advisor itself correctly reads these live ledgers. A short UI-source comment documents that invariant and triggers exact-source Full Regression Census without altering production behavior.

Other failures in that earlier census were outside this claim: concept front-face artwork escaped the head-only area in `concept_modular_browser_qa.py`, and simulated Android player switching failed in `control_reliability_browser_qa.py`. Preserve existing graphics/controls agent ownership; those are not fixed or passed by this test-only checkpoint. New post-fix browser results must be verified separately.

## Test-fixture correction delivered and next checkpoint (16 October 2026)

- [Source/test commit `d9c7274c`](https://github.com/saeedsai/SuperMagicFootball/commit/d9c7274c265ecb88d4269cf2e8d6b014c5fbf947) repairs the browser fixture's atomic pause/fatigue/morale setup. No game engine, UI rendering behavior, input binding, roster or save files changed; the comment in `ui.js` documents the authoritative game ledgers.
- [Modular QA #38898721496](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898721496) on exact source `d9c7274c` **SUCCESS**: **97/97 active Node tests PASS**, plus 17 Python merge and 8 coordination-protocol tests; current modular test build, data checks and Python compile passed.
- [Full Regression Census #38898721461](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898721461) on `d9c7274c` is **PENDING** at this checkpoint. Run must complete with all four Node+four Chromium shards before global green certification. Prior #38897958209 had both the now-corrected halftime test failure and separate concept graphics/mobile controls failures. Do not incorrectly pass or dismiss those.
- [Hosted desktop/touch Quick Match smoke #38891468528 (attempt 3)](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **SUCCESS after source integration**: both browser environments loaded live version `0.8.25.32-integrated` with 224 teams, selected teams, kicked off and entered an active 20%-longer-pitch match. This is simulated touch, not physical iOS or Android, and generic smoke does not directly exercise the coaching panel.
- Retest claim `ui-halftime-coach-browser-fix-20261016-1408-gpt6b` is to be released with this handover. **Next session:** inspect the exact `halftime_coach_browser_qa.py` status in the full-run browser shard and fix only remaining owned-scope issues under a newly acquired claim.

**5 next small batches remain:** (1) close current browser census and any named UI failure, (2) measured goalkeeper corner and Super Shot fairness, (3) owned editable eight-view glove art, (4) directional first-touch/pass visuals plus independent data provenance work, (5) career/substitution UX and accessible coaching. Never overlap active graphics/roster claims.
