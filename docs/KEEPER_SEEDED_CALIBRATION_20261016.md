# Seeded goalkeeper calibration — focused real-engine browser matrix

**Date:** 16 October 2026. **Purpose:** bounded P0 keeper activity/fairness gap from `docs/NEXT_MILESTONES.md`. This is a new replay test harness, not a balance parameter adjustment.

## Fixture protocol

The Playwright script `tests/keeper_shot_calibration_browser_qa.py` starts the **actual modular `SupermagicFootball.game`** from the generated QA HTML, invokes `g.freeBall(...)` and `g.updateBall(dt)`, and reads `keeperDiveAttempt`, `keeperContact`, `save` and `goal` events from the real engine. The fixture holds other players away from the lane, disables AI movement, fixes clear/grass conditions, and creates the same team on both sides for mirrored GK ability.

Matrix per browser context: 3 frame rates (30/60/120Hz) × 2 keeper sides × 2 shot classes (ordinary and straight Super) × 3 lanes (center, offset 85, corner 132) × 2 fatigue levels (0 and 0.75) × 2 independently reseeded repeats = **144 controlled shots**; desktop plus simulated touch doubles the full execution to **288**. The replay asserts shot-level seed reproducibility, no save/contact invented outside the physical depth window, correct keeper team and at most one counted save per released shot. Each matching mirrored case is checked for unintended direction bias.

**Constraints:** These are representative fixed-position shot mechanics checks, not a sample of organically chosen in-match human/CPU attacks. They should not be presented as real gameplay save rates; nonlinear Super Shot families, keeper movement, pressure, player collisions and contextual tactics require separate cohorts. In particular, no goal or save is credited for animation-only dive intent.

## Execution

```sh
python3 scripts/build.py
python3 tests/keeper_shot_calibration_browser_qa.py
```

The complete `Full Regression Census` workflow discovers the new browser test and is triggered by changes to it. Refer to its exact git SHA and actual CI result before labelling the iteration certified. The tester prints summary counts per desktop/touch, plus PASS/FAIL acceptance, in GitHub Actions logs.

## Next five iterations

1. Interpret seeded keeper results and make at most one bounded, evidence-backed physical movement improvement with both-direction goal/corner fairness.
2. Finish eight-direction glove grip and keeper distribution visuals.
3. Improve first-touch and passing follow-through.
4. Add source-aware agent edit provenance and graphics preset reviews.
5. Enhance career/tactics substitution feedback without save migrations.

No roster, physical art asset, controls, goal geometry, ability rarity, save format or player ratings are modified by this test-only iteration.

## First regression feedback and correction

The first browser run exposed a **counting-assumption bug in the new test**: one physical keeper contact could yield more than one raw `save` notification in its event stream. A scoring attempt must be counted **once**, not once for every event notification. The calibrated matrix now retains raw notification count as `duplicateSaveEvents` for diagnosis, while `keeperSaves` records whether an attempt produced at least one save. Distinct physical contacts remain bounded by the original geometry; the test still rejects off-plane contact and a save lacking any keeper contact/ability evidence. This keeps the metric honest without silently changing the game engine. Both mirrored sides now start with **identical** seeded RNG streams, rather than different side-specific seeds.

The first full-regression browser shard also showed a separately owned, intermittent simulated-mobile `team_combos_browser_qa.py` failure (`noLaunch=false, cross=false`). It is unrelated to keeper shots. This shard must pass on a clean rerun or receive a separately tested targeted fix before the complete census can be marked green.

## Certified exact-source result — test fix and full regression

The final code/test checkpoint is [`06c0b30b6503fabdc1af6d9a5c551ddccecc869f`](https://github.com/saeedsai/SuperMagicFootball/commit/06c0b30b6503fabdc1af6d9a5c551ddccecc869f), after the initial new-test assertion and seed-isolation issues were corrected. [Full Regression Census #38883629200](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38883629200) **COMPLETED SUCCESSFULLY**:

| Gate | Verified result |
| --- | --- |
| Preflight | PASS |
| Historical and current Node scripts | **97/97 PASS** (25 + 24 + 24 + 24) |
| Historical and current Chromium scripts | **52/52 PASS** (13 + 13 + 13 + 13); includes new calibration script |
| Total regression | **149/149 PASS**, 0 fail, 0 timeout, 0 error, 0 not-run |
| [Modular Game Dev QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38883629330) | SUCCESS, including active Node, JSON and roster checks |
| [GitHub Pages deployment](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38883630437) | SUCCESS for the test-code SHA; the playable runtime itself was not modified |
| [Hosted Chromium PC and simulated-touch smoke](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38878886873) | Fresh successful rerun after deployment: HTTP 200, menus, Quick Match/team selection and active kickoff on both |

The **initial** census [#38882883860](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38882883860) had two failed browser scripts: this new test assumed every physical keeper save creates only one raw `save` event, and an inherited mobile team-combo assertion intermittently failed. The new test now checks a **saved shot** once while reporting duplicate raw notifications separately; it still strictly enforces one physical contact and no phantom saves. The inherited mobile combo script passed unchanged in the final complete rerun. There are **no failed executable scripts in final run #38883629200**.

**Limitations:** raw duplicate notification events remain measurable and deserve a separate audit before being interpreted as distinct saves. These controlled fixtures isolate shot/goalkeeper mechanics; they do not estimate representative human-vs-CPU match outcomes or justify widening keeper contact/goal geometry. Physical iOS/Android and offline/PWA certification remain deferred.

## 16 October 2026 — duplicate catch/save guard

The event audit identified a gameplay-path defect: after an ordinary keeper dive successfully **catches** the ball, `updateBall` previously continued into the fallback loose-ball collision loop in the same frame. That loop could collect the already-owned ball again, emit a second `save`/`keeperCatch` notification, and overwrite the intended `keeperDiveCatch` animation with `keeperCatch`. The modular engine now returns immediately if the keeper owns the ball after the dive check. This does not alter saves, contact depth, shot velocities, team rosters or fallback collision behavior while the ball is loose.

The mirrored seeded calibration browser harness now rejects more than one raw `save` notification per seeded shot (in addition to counting one shot-level save), on desktop and simulated touch across the full existing 144-scenario matrix per device. Historical `duplicateSaveEvents` remains in the printed report to document zero or any discovered regressions. Exact-commit CI outcome is recorded in `docs/KEEPER_SINGLE_SAVE_QA_20261016.md`.
