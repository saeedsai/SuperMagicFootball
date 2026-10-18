# Manager Career — pre-match bench readiness and reserve recommendations

**Date:** 18 October 2026  
**Feature / lock:** `UI-CAREER-BENCH-READINESS` / `ui-controls`  
**Agent:** `gameplay-review-20261018-gpt6-career-bench-r8`

## Problem and delivered feature

The previous opponent scout warned that a career squad contained low-fitness or injured players, but offered **no actionable positional replacement** before the next fixture. In the existing Manager Career **NEXT OPPONENT SCOUT**, the new **BENCH READINESS** section:

- Uses the current saved home-club six-player plan via `planFor(c.club).lineup` and the live twelve-player `career.roster`. A fully fit starting six yields a positive readiness message with no invented substitute.
- Identifies the **injured first**, then starters below **60%** fitness, never a healthy starter or a merely fatigued reserve.
- Suggests a bench player in the **same actual role** (GK → GK, DF → DF, etc.) who is not already a starter, not injured and at least 60% fit. Ranks candidates by fitness, then positional OVR, then original squad index. Each proposed reserve is used at most once.
- Reports **no healthy same-position reserve** when no valid bench alternative exists. Shows at most three detailed starter warnings and counts any additional players.
- Escapes dynamic player names and roles, avoids writing plan/lineup/save/economy, does not add a new match action, and links naturally to the existing **12-PLAYER SQUAD** and tactical management choices.
- Reports advice only. The existing Career Match launch remains unchanged; injuries are *not* silently auto-replaced.

This is an entirely bounded UI enhancement. No engine physics, transfer economy, team or player identities, World/Club datasets, input mappings, artwork or save schema were changed.

## Source and tests

| Artifact | Purpose |
|---|---|
| `src/modules/ui.js` | New pure `careerBenchReadinessPanel(c)` helper embedded inside the existing read-only opponent scouting report |
| `tests/career_bench_readiness.test.cjs` | 11 real-source helper tests for healthy, injury, role matching, no unavailable reserve, no starter reuse, unique recommendations, priority, invalid input, HTML escaping, side-effect freedom and 3-row limit |
| `tests/career_bench_readiness_browser_qa.py` | Real Manager Career and live match on desktop and simulated-touch Chromium; healthy and injured goalkeeper scenario; protected twelve-player squad IDs, game plans, score, four-button action layout and saved career |
| `tests/career_opponent_scout.test.cjs` | Minimal compatibility update to its existing standalone VM source extractor so a second independent helper can be declared after the original without breaking legacy six-case coverage |
| This handover, `docs/NEXT_MILESTONES.md`, this chat's own memory | Small checkpoint and next work |

## QA and known integration risks

- [UI change `3319e264`](https://github.com/saeedsai/SuperMagicFootball/commit/3319e2648958abc6243ff32fafc2bcad1fe813f5).
- [11 Node cases `853dcd13`](https://github.com/saeedsai/SuperMagicFootball/commit/853dcd13b49ee6e9a4bc65628a82ac62698a57cb).
- [Browser test `7cf85e15`](https://github.com/saeedsai/SuperMagicFootball/commit/7cf85e15572041c7b8351101eeb8aee2fd0e30f6).
- Initial Node source extractor error `helper is not a function` was **our test harness** and corrected in [`9d437ed1`](https://github.com/saeedsai/SuperMagicFootball/commit/9d437ed172027c4cc2b1ac2f9851831a35b5101d). The older opponent-scout test needed a precise old-function boundary, updated in [`90cf1058`](https://github.com/saeedsai/SuperMagicFootball/commit/90cf1058bd73654f5241d911bfb28d0f84225a0c) and the trailing-comment delimiter fixed in [`c179b69f`](https://github.com/saeedsai/SuperMagicFootball/commit/c179b69fd5175df5fbbfefc4662da52b238fab98).
- Concurrent concept-graphics C01 front face/collar commits caused two independent `tests/concept_modular_v1.test.cjs` **test expectation mismatches** in the initial combined Node runs. These belong to a **separate graphics-renderer owner**; do not edit unrelated artwork/tests. Review the latest full regression before claiming they persist.
- Current original baseline [full census #39027099446](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39027099446) was completely green before this feature; it **cannot** certify the new code. Confirm next source-descendant full census, browser test and exact Pages workflow; report missing evidence explicitly.

Local commands, if source checkout is available:

```sh
node --test tests/career_bench_readiness.test.cjs tests/career_opponent_scout.test.cjs tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs
node --test tests/*.test.cjs
python3 scripts/build.py
python3 tests/career_bench_readiness_browser_qa.py
# GitHub Actions: Full Regression Census (4 Node + 4 Chromium), hosted PC/touch smoke
```

The About screen retains its GitHub `dev` SHA fetch per commit, separate from bundle version `0.8.25.32-integrated`; no release-infra or About code was edited. Physical Android/iOS devices were not available in this session.

## Cleanup and next five iterations

No tracked build-cache folders, generated Playwright screenshots or test fixture HTML were intentionally added. Historical artwork and QA provenance are retained unless a dependency audit proves any file obsolete.

1. Certify exact-code Node + desktop/simulated-touch Chromium and feature-containing GitHub Pages, resolving the independent C01 concept-art tests in its own claim.
2. Explore safe manager squad lineup selection for replacements before kickoff, with opt-in user approval and save-schema invariants.
3. Calibrate goalkeeper save/clear and first-touch press under distinct engine ownership and seeded tests.
4. Fix rapid mobile double-tap rainbow dribble issue #3 if reproducible on current Android or emulation.
5. Continue classic competitions, offline PWA, physical device reliability and remote multiplayer as separately claimed features.
