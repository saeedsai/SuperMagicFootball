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
