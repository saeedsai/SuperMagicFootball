# v0.8.24.5 Alpha — QA and Regression Report

Date: 14 October 2026. Built from the v0.8.24.4 ZIP.

## Executed evidence
- **Node: 63/63 scripts PASS** on the final corrected build. Evidence `docs/qa_runs/master_full_node_s0of1_v08245final.json`.
- **Chromium: 13 distinct scripts passed** from targeted, smoke and interrupted sequential-shard runs, including the two previously failing tactics and save-filter scripts. The full 38-script suite was **not completed**, and this is **not a full browser certification**.
- The new Node release-alignment contract checks 43 browser-version assertions against the package version and ensures save-export, source and cache IDs match.
- The previously intermittent aerial Super Attack browser script passed in its targeted rerun.
- Historical 402 QA requirements are a *catalog*, not individually executed checks; new release-alignment cases are documented separately.

## Corrected defects
1. Old `0.8.24.3-alpha` browser startup expectations could timeout or fail against later builds. Updated in active browser tests for v0.8.24.5.
2. Save-filter browser roundtrip still asserted exported version `0.8.24.3`. Updated to current version; both desktop and simulated touch passed.
3. A renamed version-linked match-matrix test in the runner caused a false Node failure; restored reference to the real file and reran 63/63 green.
4. Added `tests/v08245_release_alignment.mjs` to catch future drift automatically.

## Unresolved
- Finish the remaining 25 unverified browser scripts as an uninterrupted sequential regression; some longer runs were interrupted.
- Human-vs-CPU scoring distribution, goalkeeper fairness and shot quality remain statistically inconclusive from small AI-vs-AI samples. No unjustified mechanics changes made.
- Safari/Firefox, hardware mobile, controllers, audio-origin persistence and low-end device performance remain unverified.

Script-level statuses and process outputs are retained under `docs/qa_runs/`.
