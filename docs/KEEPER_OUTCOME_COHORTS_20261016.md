# GK-OUTCOME-COHORTS — goalkeeper fairness diagnostic checkpoint

**Date:** 16 October 2026. **Owner:** `keeper-cohort-20261016-gpt6-chat6`. **Exclusive lock:** `gameplay-engine`.

## Small requirement delivered

`src/match_telemetry.js` now records the keeper's **observed target-offset at the moment a real ordinary/Super Shot is released**, separately from the legacy origin fallback. If no finite aim or keeper observation is present, the target is **unobserved**, not artificially counted as centered.

The existing `keeperCalibration` report adds two complete, non-overlapping cohort partitions:
- `byTargetOffsetBand`: `near` below 65 game-world units from the keeper at release, `stretch` 65–144.99, `wide` at least 145, `unobserved` otherwise.
- `byKeeperFatigueBand`: `rested` below 0.35, `moderate` 0.35–0.69, `tired` 0.7–1, `unobserved` otherwise.

Each band contains the previous keeper activity fields (`shots`, attempted/contacted dive events) and **real event-backed** `goals`, `saves`, `deflections`, `otherOrUnresolved`. There are no inferred goals or save percentages. Every ordinary/Super Shot falls in exactly one band in each partition; passes and clearances never enter the denominators. Existing fields `keeperLateralOffset` and all previous telemetry keys are unchanged. There is no game physics/AI, roster/age, rendering, controls, input, score, team indexing or save-format change.

## Reproduction and acceptance

```sh
node --test tests/keeper_outcome_cohorts.test.cjs
node --test tests/keeper_dive_telemetry.test.cjs
node tests/v082411_opportunity_telemetry.mjs
node tests/v082412_release_context.mjs
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/*.test.cjs
```

New contracts: mirrored defended goal sides; authentic shot/deflection/goal outcome attribution; target/fatigue bands; no phantom saves; missing/invalid values; stable release snapshots when the keeper later moves; near/stretch/wide and fatigue threshold boundaries; and invariance of pass denominator and gameplay object.

**CI results:** pending exact-source Modular QA / Full Regression Census. The workflow already watches `src/match_telemetry.js`, so no shared release-infra files are changed. The playable game Pages URL is https://saeedsai.github.io/SuperMagicFootball/ . Hosted PC and simulated-touch smoke is distinct from physical-device certification.

## Unfinished acceptance and next five bounded iterations

1. Run **real AI-controlled**, seeded mirrored normal and nonlinear Super Shot attempts at multiple FPS/keeper fatigue levels; compare actual event-backed shot outcome cohorts and near-post scores before altering physical contact limits.
2. Finish illustrated eight-direction goalkeeper glove grip/hold/release art under a new graphics lock.
3. Improve directional first-touch and passing animation with dedicated visual regression.
4. Strengthen source-aware provenance/appearance checks for parallel roster and graphics editor batches, keeping ID quotas and saves stable.
5. Add halftime/career substitution suitability/coaching feedback without changing stored lineups automatically.

Long-term: full traditional game-mode parity, physical iOS/Android tests, PWA/offline/restart persistence, broad FC27 player source validation, Super Defense/Tricks and multiplayer. Do not delete historical QA reports, sourced player data, graphics assets or archived regression scripts. Existing `.gitignore` excludes transient artifacts; cleanup is deliberately conservative while concurrent claims are active.

## Additional pressure-dependent outcome cohorts

The same event-backed `keeperCalibration` also includes `byReleasePressureBand` for the already-captured release-time defensive pressure (`close`, `medium`, `open`, `no_active_defender`, `unobserved`). Each partition reports the same authentic goals, catches, deflections and unresolved counts. All five bins together contain exactly the real ordinary/Super Shot denominator; a missing or invalid pressure band stays unobserved. This complements `shotReleasePressureCounts` without changing its format or counting animation intent as a save. Fatigue and target-distance measurements are binned at the existing two-decimal release-snapshot precision. New Node tests assert mirrored pressure samples and partition sums. No engine/roster/graphics/CI change.


## CI and hosted-game verification checkpoint

- **Feature source and first four tests:** [`415691b6`](https://github.com/saeedsai/SuperMagicFootball/commit/415691b6f5622818d5905559f79ac2e97f625f4e).
- **Final read-only source/test release:** [`eee6b3ed`](https://github.com/saeedsai/SuperMagicFootball/commit/eee6b3ed322ddca0f291310da7f3b06cfd255d85), adding pressure cohorts and asserting complete shot partitions. The preceding unit test for a 0.349 fatigue value was corrected to 0.34 because legacy `shotReleaseContext` intentionally snapshots fatigue at two decimal places. No gameplay or match constants changed.
- [**Modular Game Dev QA #38897958330**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38897958330) on the final source SHA **SUCCESS:** **95/95 active Node contracts PASS** and **17/17 Python merge tests PASS**, along with the roster/data preflight. The new keeper suite passed.
- [**Full Regression Census #38897958209**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38897958209) on the final source SHA passed preflight and all four Node shards: **110/110 executable scripts PASS** (28 + 27 + 27 + 28); four Chromium shards were still running when this checkpoint was written. Never claim a full-census PASS until their actual result is checked.
- [**Public GitHub Pages desktop and simulated-touch smoke #38891468528, latest successful run**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **SUCCESS:** live hosted HTTP 200, menus, teams selection, Quick Match kickoff, extended pitch, and active match on desktop and touch-emulated Chromium. The served build reported version `0.8.25.32-integrated` and 224 runtime teams. This is **not** physical-device certification.

### Observability limitations

These new telemetry cohorts are not a statistical sample or a claim of balanced keeper behavior. No rates should be inferred from unresolved or open shots. The immediate next gameplay batch should run seeded **actual live-AI** ordinary and nonlinear Super Shot cohorts and report saves/goals by these bins. A bounded physical keeper change should only follow concrete, mirrored corner/interception evidence. Keep unrelated roster/art/UI and their live agent claims unchanged.

### Handover and claim release

Scoped owner: `keeper-cohort-20261016-gpt6-chat6`, lock `gameplay-engine`; all source/tests/documentation changes were committed on current `dev` using non-force, compare/refresh integration. After exact gate capture, release the lock with this document. Do not delete historical tests or other agents' assets; no unused tracked scratch files were identified as safe to delete.


## Final exact-source Full Regression Census result — release handover

**Feature code SHA:** `eee6b3ed322ddca0f291310da7f3b06cfd255d85`. [Full Regression Census #38897958209](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38897958209) finished **FAILURE overall**: **110/110 Node scripts PASS** (28+27+27+28); **56/59 Chromium scripts PASS** (14/15, 14/15, 14/15, 14/14); combined **166/169 executable scripts PASS, 3 FAIL, 0 ERROR, 0 TIMEOUT, 0 NOT_RUN**. Preflight was green. The new keeper source/test was not among the failures and [Modular QA #38897958330](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38897958330) passed **95/95 active Node** and 17/17 data-merge tests.

**Three independent browser failures on the exact commit:**
1. `concept_modular_browser_qa.py`: painted concept front-head region assertion exceeded limit, observed 133 vs expected below 123 (graphics-renderer scope).
2. `halftime_coach_browser_qa.py`: halftime UI browser integration assertion failed (ui-controls scope, inspect workflow log).
3. `control_reliability_browser_qa.py`: simulated Android switch selection remained index 3, no switch events and no grace window (UI/gameplay controls scope, pre-existing intermittent acceptance).

None is caused by the read-only `MatchOpportunityTracker` code changed here. They were left to their active/next appropriate owners; fixing them would require claiming other scopes and would risk concurrent agents' source. **Do not call this exact-source full regression green.** A later full regression after the owning agents' corrections may certify descendant commits, but it is separate evidence.

**Live game after deployment:** [hosted PC/touch smoke #38891468528](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528), most recent checked rerun, **SUCCESS**: public GitHub Pages HTTP 200, menus, team selection, kickoff and active match on desktop Chromium and simulated touch. Physical iPhone/Android devices remain uncertified.

**Next developer action:** check latest `dev` head/claim registry before starting; resolve independent Chromium gates under the appropriate graphic/UI/controls ownership. Afterwards run a seeded real-AI/nonlinear Super Shot keeper fair-goal cohort using the new release diagnostics. The new target-offset/fatigue/pressure classifications are accepted by active Node QA but do not themselves assert goalkeeper competitive balance. Keep archives and historical QA evidence; no tracked deletion was justified in this small telemetry-only release. Release the `gameplay-engine` claim with this handover once pushed.
