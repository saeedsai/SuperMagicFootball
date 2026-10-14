# Supermagic Football — v0.8.24.9 Alpha test report

**Date:** 14 October 2026. **Source:** v0.8.24.8 Alpha. **Final build:** v0.8.24.9 Alpha.

## Executed test suites

| Suite | Result | Actual scope |
|---|---|---|
| `npm test` | **66/66 PASS** | 64 inherited Node regression scripts plus 2 new v08249 scripts; both new tests passed |
| `node tests/master_contracts.mjs` | **1/1 PASS** | Release metadata, roster inventory, 4 actions, 6 formations, save/gameplay invariants and 430-row QA catalog |
| Full Chromium browser regression | **40/40 PASS** | Eight independent completed five-script groups, including desktop and simulated-touch tests |
| Zero-human input ownership | **PASS** | Three human counts 0/1/2, proper autonomously controlled home player when no humans |
| New full-engine scripted CPU challenge scenarios | **120/120 completed** | Five difficulty settings, three home/away pairs, two shot distances, four seeds; moving keeper and defender verified |
| Release-alignment checks | **45 checked, PASS** | Browser scripts not expecting stale versions |
| QA catalog | **430 documented requirements** | NOT 430 separately executed requirements |

The first attempt to run Chromium group 2 was interrupted. **A fresh complete five-script rerun passed**, and all other seven groups passed. Eight final per-shard JSON reports are in `docs/qa_runs/`; the aggregate is `docs/QA_EXECUTION_v08249.json`. See these files for exact script names and timings.

## Confirmed defect fixed

In `humans=0`, the engine formerly marked the home team's designated outfielder as controlled by a nonexistent human. The `inControl` rule, controlled-player update, auto-switch loop and penalty ownership now respect 0/1/2 humans. The AI-vs-AI home player moves autonomously, and single-/two-human controls remain unchanged. This fixes a bias in zero-human game simulations; prior AI-vs-AI balance numbers are **not comparable** to post-fix data.

## Single-player CPU calibration results

The new scripted-shot test executes 120 attacks with real `GameEngine.update(1/60)`, active CPU defenders and moving keepers (24 shots per difficulty). Recorded goals by difficulty **0 through 4**: **2, 0, 0, 0, 0**. Keeper save events: **21, 16, 20, 19, 8**. All 120 active goalkeepers and AI defenders moved, and numerical ball/player invariants held. This is a **diagnostic test**, not 120 wins/losses or 120 independent full matches. Saves and non-goals may reflect varied defensive pressure, possession changes, and shot quality; the sample is too small for effective keeper balance or difficulty curve estimates. No unsupported save or shot-power tuning was introduced.

## Regression and release status

All inherited game mechanics passed available Node/Chromium scripts, including five-category menu navigation, saves, BPW World Cup/All-Time Legendary 12, four-button controls, Super Shot/Header/Bicycle, graphics and audio UI. Portable `play.html` built successfully. Hardware controllers, physical mobile, Safari/Firefox, real-origin audio persistence, production frame rate and statistically representative human-versus-CPU match outcomes remain **unverified**. Use v0.8.24.10 to build replay-driven full matches before retuning.

## Release cleanup

Removed 54 generated test screenshots and stale temporary QA-shard reports; kept the original 2026 menu handoff, historic changelogs and calibration records, deferred abilities specification, and every executable test. Final ZIP manifest/integrity and standalone HTML checks passed.
