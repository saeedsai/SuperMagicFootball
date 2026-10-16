# SuperMagic Football — next five iterations after JSON mechanics release (16 October 2026)

**Source of truth:** latest `dev` branch, and exact git commit on which every QA run executes. As of 15 October 2026, concurrent roster and graphics agents had already integrated their changes into `dev`; their subsequent FC27 source-probing and comparison-image commits must not be overwritten. Preserve 223 teams, 2,676 players, seven BPW squads, all persistent IDs and stable team indices, 2GK/3DF/4MF/3FW, five main menu groups, four action buttons, six formations, and existing save schema.

| Next iteration | Focus | Implementation and acceptance |
|---|---|---|
| **v0.8.25.35** | Gameplay animations | Refine keeper landing/recovery pose, ball reception and pass follow-through across eight directions, without changing match physics. |
| **v0.8.25.36** | Parallel data/editor integration | Add dry-run diffs, conflict reports and graphics preset cross-checks to the three-way merge workflow. |
| **v0.8.25.37** | Career and tactics UX | Improve squad maintenance, substitution feedback and AI tactical recommendations while protecting legacy saves. |
| **v0.8.25.38** | Player graphics refinement | Named-player identity review, hair/beard/accessory overlap, and source-verified character art comparison. |
| **v0.8.25.39** | Advanced mechanics configuration | Extract bounded first-touch, player-contact and goalkeeper reach tuning with default parity and seeded match calibration. |

**Delivered this iteration — v0.8.25.34:** the modular engine now loads and validates editable `physicsTuning.passSpeed` (base, quality multiplier, ceiling) and `physicsTuning.keeperDiveRecovery` (base, stat/fatigue coefficients, min/max). These use the historical defaults unchanged. See [ENGINE_PHYSICS_TUNING_20261016.md](ENGINE_PHYSICS_TUNING_20261016.md). The 20% field extension and concurrent 2026 player/graphics work are retained.

## Current integration/QA hygiene

Run `scripts/parallel_data_merge.py` with three checkout trees when multiple agents edit the same JSON, follow [PARALLEL_DATA_MERGE_GUIDE.md](PARALLEL_DATA_MERGE_GUIDE.md), and require GitHub `Modular Game Dev QA` and `Full Regression Census` green on the exact integrated commit. Do not force-push or cherry-pick changes already in current `dev`. Old docs, QA evidence and agent workflow files are historical or independently owned: clean only proven-unused artifacts.

## Far-future backlog — owner-deferred

- Complete GitHub Pages interactive gameplay, refresh/import/export and browser-process save persistence certification.
- Physical Android/iOS devices, performance/FPS tuning on devices, offline/PWA and install certification.
- Worldwide team roster research, Super Defense, Tricks and multiplayer/network architecture, until explicitly rescheduled.

Routine GitHub Pages build/deployment reporting continues, but is **not** a substitute for real browser interaction and is **not** a development priority.
## Pitch dimension requirement fulfilled (15 October 2026)

One new owner-requested requirement: increase the playable field length **20%** while keeping pitch width, goal mouth size, world end margins and gameplay controls stable. Implemented in `data/mechanics/gameplay.json` with new geometry, browser camera and Node contract checks. Next five graphics/mechanics/animation/parallel-data/career priorities above stay intact; near-term hosting/restart persistence and physical mobile/PWA certification remain owner-deferred.

## QC gap carried forward from simultaneous source-backed roster work

Historical roster snapshots can fail because the new source imports changed birthdate representation, verified-status annotations and player membership. Preserve current IDs and authoritative JSON; only update archived tests after validating source evidence. Do not treat old assertions about FC27 source IDs as proof of correct 2026 rosters. The shipped modular game +20% geometry and keeper-only default formation are covered by active tests; historic legacy census is an explicitly tracked acceptance blocker until reconciled.

## 16 October 2026 — early parallel-merge safety checkpoint

A small part of the planned **v0.8.25.36** parallel-agent integration work has been implemented early: protected numeric team-index invariants and concise `--check` / `--report` field-diff previews in `scripts/parallel_data_merge.py`. This is not completion of v0.8.25.36's editor/provenance UI or cross-checks. Keep the five planned iterations in the table above, with animation still first. No player roster, visual art, runtime mechanics or save schema modifications were made in this checkpoint.

## New owner priorities: Super Shot fairness and goalkeeper behavior (16 October 2026)

- **P0 — Super Shot fairness: delivered as a first conservative balance pass.** `physicsTuning.superShot.speedMultiplier=0.96` slows Super Shot launches by 4%; `fatigueMultiplier=1.08` makes Super Shot and combo-Super exertion 8% more costly. They retain the former normal-shot and pass paths. Calibrate special-level goal/save rates later rather than declaring overall fairness solved by one edit.
- **P0 — Make goalkeeper dive more actively: OPEN.** In the next focused gameplay iteration, add real approach-phase dive intent and/or shorter verified readiness latency, while preserving the small contact-depth window, swept contact and goalkeeper-vs-corner fairness. Use mirrored seeded ordinary/super shot and fatigue benchmark fixtures before selecting parameters.
- **P0 — Allow goalkeeper to hold the ball in their hands: FIRST CAPABILITY DELIVERED.** Real catches retain ball possession, with the ball rendered at glove/chest height (instead of foot height), a visible `keeperHold` state and deliberately longer short carry before AI distribution; pressure triggers a quicker throw/punt. Further full eight-view glove-grip animation, tactical holding, and human distribution UX are OPEN follow-ups.

### Revised next five bounded iterations (owner priorities supersede older ordering)

1. **v0.8.25.36 — active keeper dives:** collect keeper dive triggers/latency, make a narrow bounded change, add mirrored save/corner and fatigue regression.
2. **v0.8.25.37 — keeper glove poses:** consistent goalkeeper ball holding and release animation in eight directions, graphics regression on desktop/touch.
3. **v0.8.25.38 — reception and pass follow-through:** advance existing motion without altering pitch physics.
4. **v0.8.25.39 — concurrency safeguards:** dry-run source/provenance conflict and appearance-reference validation.
5. **v0.8.25.40 — career/tactics usability:** squad swaps, substitutions and coaching feedback without save migration.

Named-player art and further physics coefficients stay in the backlog. Earlier numbering and achievements above are historical and retained for traceability.

## 16 October 2026 — follow-on integration safety batch

A bounded part of the future concurrency milestone is implemented ahead of schedule: three-way merges now reject graphics appearance records pointing to teams or players missing from the merged catalog, and `--report` is forbidden inside either input or merged-output trees. These are developer-side protections only; gameplay, source-backed rosters, artwork values, numeric indices and saves are unchanged. New Python contract coverage is included in the dev-quality and full-regression preflight. **Next five gameplay-facing iterations remain ordered as above**, beginning with actively diving goalkeepers. Full live-site device certification remains deferred and CI pass results must be tied to the new exact commit, not historical counts.

## Current focused checkpoint — keeper diving activity (16 October 2026)

**Chosen P0 requirement:** make autonomous goalkeepers visibly commit to an incoming credible shot *before* the physical contact frame, including misses, rather than showing dive animation only on successful saves. The playable modular engine now records one `keeperDiveAttempt` event and invokes the existing directional dive/recovery pose when short-horizon prediction meets shot direction, reachable height, goalmouth and lateral guardrails. Anti-repeat intent cooldown, striker-facing checks and recovery clearing are implemented. The match ball and goalkeeper positions are **not teleported**, and only the pre-existing narrow depth-plane/swept contact paths can record a genuine save.

**Acceptance not yet assumed:** run targeted browser 30/60/120Hz in both directions, current/legacy Node tests, full sharded regression and actual hosted PC/touch smoke on exact commits before calling the checkpoint QA-certified. This closes only the *visible early dive attempts* portion of the request. Increasing **actual keeper interception rate** needs subsequent measured movement/goal fairness tests; do not blanket widen keeper hitboxes.

### Next five focused iterations following this checkpoint
1. Collect seeded live dive-attempt versus keeper-contact telemetry, calibrate physical movement only after confirming a shortfall; preserve both goal directions and corner scoring.
2. Finish goalkeeper hand-holding glove animation and ball distribution poses in eight directions.
3. Refine ordinary first touch and pass follow-through using existing controls; add desktop/touch visual regression.
4. Add source/provenance and appearance-reference checks to parallel editor and JSON merge reviews, without touching roster/graphics agents' files.
5. Improve halftime/reserve substitutions, formation suitability and career tactical coaching hints with save-key compatibility.

Other major roadmap domains (original parity, all modes, animated art production, new abilities and network play) remain in [REQUIREMENTS_REVIEW_20261016.md](REQUIREMENTS_REVIEW_20261016.md). Physical iOS/Android/PWA and exhaustive persistence certification stay owner-deferred.

## 16 October 2026 — keeper dive measurement checkpoint (post anticipatory intent)

Delivered an isolated **shot-linked keeper calibration instrument**, following the earlier proactively animated goalkeeper dive. Optional `MatchOpportunityTracker` now distinguishes `keeperDiveAttempt` from `keeperContact`, counts mismatches and missed attempts, and reports regular/Super Shots and the two defending directions separately. Four new Node contract tests passed the active QA suite. This is **not** an increase in physical saving rate and does not widen contact geometry; that decision requires controlled seed-matched evidence. The work is in `src/match_telemetry.js`, `tests/keeper_dive_telemetry.test.cjs` and `docs/KEEPER_DIVE_TELEMETRY_20261016.md`. The source-only checkpoint is `b7d922aa`, with full regression evidence required before final release certification.

### Five subsequent bounded iterations, in owner-priority order
1. **Keeper calibration:** collect repeatable mirrored real-engine shots at multiple velocities and GK fatigue levels, compare event-linked intent/contact/goal frequencies and choose one bounded physical-approach adjustment *only if evidence warrants it*.
2. **Keeper ball grip / distribution poses:** eight-direction glove holding, release and recovery visual QA, preserving physical ball possession and four controls.
3. **Reception/pass animation:** first-touch and follow-through motion in all directional poses with desktop/touch regression and no speed/spread change.
4. **Source-aware concurrent edits:** protect player identity provenance, audit custom graphics IDs and produce reviewed agent-conflict previews. Existing ID/index, report-path and dangling-appearance protections remain in place.
5. **Career/tactics usability:** substitution feedback, squad role suitability, halftime coaching, and persisted-save compatibility with no schema migration.

Owner-deferred long-term scope: physical-device/PWA/offline/restart certification, Super Defense/Tricks, multiplayer and exhaustive global roster source review. Preserve concurrent roster and art agents' files.


### Verified keeper telemetry checkpoint

The preceding telemetry feature checkpoint `b7d922aa` has now passed [full regression 147/147](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38881038162) (97 Node + 50 Chromium) and [active QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38881038084) (66 active Node tests). The five next milestones above remain the active plan: keeper calibration, held-ball glove animation, reception/pass follow-through, source-aware merge provenance, career/tactics UX. Source provenance, existing rules and physical-device deferred scope are unchanged.

## 16 October 2026 — real-engine goalkeeper calibration matrix (bounded iteration)

The next keeper calibration requirement is now covered by a deterministic, mirrorable **real modular browser-engine test**, `tests/keeper_shot_calibration_browser_qa.py`, with 144 seeded shots per desktop/touch context (3 frame rates × 2 directions × 2 shot kinds × 3 lanes × 2 fatigue settings × 2 repeats). The harness uses the playable `g.freeBall` and `g.updateBall` methods and checks real `save`, `goal`, `keeperDiveAttempt` and `keeperContact` events. It does not change reach, power, goalkeeper movement or human controls. See `KEEPER_SEEDED_CALIBRATION_20261016.md` and exact source-commit GitHub Actions for accepted results; do not claim improved goalkeeper saves from test-only changes.

**Next five bounded iterations:**
1. Evaluate measured saves versus missed anticipatory dives on full-engine seeded fixtures; make only one guarded approach/movement change if evidence supports it, preserving goal corner fairness.
2. Animate eight-direction glove holding and ball release without changing possession mechanics.
3. Improve ball reception/first touch and directional pass follow-through, with desktop/touch visual acceptance.
4. Expand reviewed source/provenance conflicts for concurrent roster and graphics editors.
5. Improve career/tactics substitution suggestions, lineup suitability and half-time feedback while retaining legacy saves.

The old milestone table above is historical; this section is the current ordered plan. Defer physical iOS/Android, offline/PWA and online multiplayer certification as previously directed.

## Release gate complete — seeded keeper scenario acceptance

Verified `06c0b30b`: full [149/149 regression scripts passed](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38883629200), with 97 Node and 52 Chromium tests. The seed-mirrored modular browser calibration is now a reproducible acceptance fixture; it did **not** change save physics. The next five active iterations remain: (1) measured physical GK movement and corner fairness; (2) glove-grip/release animation; (3) first touch and pass animation; (4) source/provenance conflict review for parallel data agents; (5) squad/career/tactics usability. Keep physical-device and offline/PWA certification deferred as explicitly instructed.

## 16 October 2026 — bounded duplicate keeper-save correction

In the follow-up goalkeeper quality batch, a successful ordinary diving catch now ends `updateBall` processing for that frame before the generic loose-ball proximity collector. This prevents duplicated `save`/`keeperCatch` events and keeps the already assigned `keeperDiveCatch` pose. The 144-fixture-per-device seeded calibration test now asserts one raw save event per shot. No reach/geometry, goalkeeper movement coefficients, abilities or roster edits. Exact CI result: `docs/KEEPER_SINGLE_SAVE_QA_20261016.md`.

**Five next small iterations:** (1) characterize organic CPU-vs-human save gaps from representative fixtures before changing approach/reach; (2) eight-direction glove holding/release artwork (graphics agent coordination); (3) first-touch and pass follow-through visual polish; (4) provenance-aware review of parallel editor merges; (5) career/substitution tactical feedback with save compatibility.

## 16 October 2026 — priority goalkeeper double-save bug fix

The keeper's loose-ball catch no longer emits a second `save` after an earlier deflection, or mislabels a loose non-shot as a save. Physical interceptions, catch animation and controls remain unchanged. Next five: (1) calibrate seeded real-match keeper movement after correcting save-event denominators, (2) eight-view glove grip/distribution, (3) pass/first-touch animation, (4) source-aware agent editor merge review, (5) career/tactics substitutions and hints. See `KEEPER_SAVE_EVENT_INTEGRITY_20261016.md`.

## 16 October 2026 — keeper's bounded physical lateral lunge

**P0 initial movement delivered:** The live modular engine now applies a short, capped physical Y-axis keeper movement during a credible active `keeperDiveAttempt`, rather than a visual-only dive. Only autonomous goalkeepers lunge; a new shot projection is checked, fatigue limits travel and speed, and each attempt is capped at 28 game-world units. Physical contact remains narrow, with no ball teleport, free save, widened reach or keeper shot immunity. The prior mirrored seeded 149/149 QA is a baseline only; validate this source change in a fresh exact-commit census. New tests in `tests/keeper_physical_lunge.test.cjs` and `tests/keeper_physical_lunge_browser_qa.py` must pass at 30/60/120Hz in both attack directions and fatigued states. See [KEEPER_PHYSICAL_LUNGE_20261016.md](KEEPER_PHYSICAL_LUNGE_20261016.md).

### Next five small milestones, after this movement checkpoint
1. **Keeper balance verification:** run organic seeded human-v-CPU and nonlinear Super Shot replay cohorts; tune physical reach only if reproducible evidence supports it. Audit rare duplicate save event semantics after the parallel keeper-catch fix.
2. **Eight-direction keeper ball hold and release:** improve glove grip and chest-height possession/throw/punt animation while maintaining ball-handling behavior and four controls.
3. **Directional first touch, reception, pass follow-through:** readable animation transitions with untouched ball velocity; browser screenshots and fallback preservation.
4. **Concurrent roster/graphics source review:** improve provenance checks and appearance reference validation in safe separate review tooling.
5. **Career and tactics:** clearer safe lineup substitutes, formation-suitability feedback and halftime coaching preserving existing saves.

Original gameplay-mode parity, player likenesses, physical iOS/Android and PWA/offline certification, Super Defense/Tricks and network play remain open/deferred in their existing roadmap categories.

## 16 October 2026 — keeper event integrity final release gate

A real shot's save is no longer double counted when the goalkeeper later catches their own deflected rebound. The [integrated full regression 156/156](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38886072121) (101 Node + 55 Chromium) passed after the graphics agent's concurrent fixes. The **next five** remain: (1) seed-calibrated keeper positioning/goal and corner fairness using corrected shot-level counts; (2) keeper's eight-direction held-ball glove/distribution animation; (3) pass and reception motion polish; (4) source-aware parallel data/graphics provenance; (5) career/tactics substitution coaching feedback. Keep historic tests and other agents' assets; device/PWA and multiplayer certification remain deferred.

## 16 October 2026 — GK-LUNGE-FAIRNESS single-scope correction

The bounded physical keeper lunge introduced earlier had an **unbounded stacking gap**: during a committed `keeperDive`, ordinary goalkeeper AI target pursuit (`moveAgile`) could run before the limited `advanceKeeperDive`, making real keeper travel exceed its advertised 28-unit cap. Under exclusive `gameplay-engine` claim `GK-LUNGE-FAIRNESS`, the playable modular AI now skips ordinary tracking during the dive intent; the existing bounded physical lunge and real contact geometry are unchanged. This improves fair corner scoring rather than increasing goalkeeper save reach.

New real-engine desktop/simulated-touch and Node tests cover 30/60/120Hz, mirrored goals, rested/tired keeper, stale tracking targets, ball immutability before flight, movement cap and resumption after the intent. [Implementation and handover](KEEPER_LUNGE_FAIRNESS_HANDOVER_20261016.md). Release acceptance requires exact-commit full regression and hosted smoke verification; older 156/156 results refer to the previous combined SHA and are not automatic certification here.

**Next five small iterations:** (1) real-AI keeper shot/goal calibration including nonlinear Super Shot and near-corner scenarios; (2) eight-direction keeper glove holding and release, coordinated with the graphics owner; (3) first touch and passing animation follow-through; (4) provenance-aware roster/graphics editor merge review; (5) career/tactics substitutions and suitability advice. Original modes, physical iPhone/Android and offline/PWA restart QA, Super Defense/Tricks and network multiplayer remain longer-term/deferred. This batch does not touch UI, graphics, player data, releases or other owners' tests.

## 16 October 2026 — live natural-role lineup fit guidance (UI-LINEUP-ROLE-FIT)

**Small P1 UI requirement implemented:** the Team Command Center now reports how many of six selected starters match their assigned natural roles and lists mismatched slots, player names, positions and calculated position OVR. Updates live on formation or lineup dropdown changes, with `role=status` accessible text. It does not auto-substitute, modify plan/save storage or constrain the six approved formations. Desktop/simulated-touch modular browser acceptance and static Node contract were added. See [UI_LINEUP_ROLE_FIT_20261016.md](UI_LINEUP_ROLE_FIT_20261016.md). `Full Regression Census` push triggers now include `src/modules/ui.js` and both new scripts; existing runner/CI logic remains unchanged. Exact-commit green outcome pending full shard completion and hosted smoke verification.

**Next five bounded iterations after this UI checkpoint:** (1) complete and triage the full regression, including the earlier substitution Back-control issue; (2) measure keeper save fairness using actual match AI, 30/60/120 FPS and nonlinear Super Shots; (3) finish illustrated eight-direction goalkeeper glove grip/release under exclusive graphics ownership; (4) improve first-touch and pass follow-through animation plus source-aware editor references in disjoint owned scopes; (5) expand halftime coaching and lineup suitability advice with save compatibility. Physical-device browser matrix, offline persistence/restart, classic content parity and online multiplayer remain longer-term.

### UI-LINEUP-ROLE-FIT acceptance gate — 16 October 2026

The new read-only lineup-role guidance is accepted: [full regression #38894875189](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38894875189) **164/164 passed** on source `120fbda5` (106 Node, 58 Chromium). The actual role-fit desktop/touch browser QA passed, as did the previously failing substitution-advice Back selector test. [Live deployed desktop/touch smoke #38891468528, attempt 2](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) also passed. [Issue #1](https://github.com/saeedsai/SuperMagicFootball/issues/1) was closed on this evidence. See the [full owner handover](UI_LINEUP_ROLE_FIT_20261016.md). No agent-owned graphics, rosters or gameplay files were modified. Preserve future physical-device and PWA refresh/restart certification as separate requirements.

## 16 October 2026 — read-only goalkeeper outcome/fatigue cohort requirement (GK-OUTCOME-COHORTS)

The match opportunity telemetry now partitions observed ordinary/Super Shots by target-to-keeper offset (near/stretch/wide/unobserved) and release-time fatigue (rested/moderate/tired/unobserved), preserving exact shot denominators and real save/deflection/goal event outcomes without touching keeper gameplay. New unit tests cover mirrored sides, missing context, boundary values and no pass misclassification. See [KEEPER_OUTCOME_COHORTS_20261016.md](KEEPER_OUTCOME_COHORTS_20261016.md). Next five: real-AI seeded cohort calibration; illustrated keeper ball grip/release; first-touch/pass animation; sourced roster/graphics merge provenance; halftime/career coaching. Physical-device/PWA and network modes remain deferred.

## 16 October 2026 — halftime contextual coaching batch (UI-HALFTIME-COACH)

The existing in-match HALFTIME menu now displays read-only score/fitness/substitution/morale coaching notes for the human home team, and independently for away in local two-player play. It guides trailing, leading and level-score tactical choices using already available styles and warns of below-40%-fitness starters, no substitution quota and low morale. It never auto-selects a team talk, applies a plan, substitutes players or changes persistence. Separate desktop/touch Chromium and Node contracts are included. This small UI feature complements the already accepted substitution advice and [164/164 lineup suitability full regression](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38894875189).

**Handover and exact QA:** [UI_HALFTIME_COACH_20261016.md](UI_HALFTIME_COACH_20261016.md). Verify current integrated source in Full Regression Census, active QA and the live hosted PC/simulated-touch smoke. Previous clean census belongs to an earlier SHA.

**Next five small batches:** (1) exact-source halftime regression certification; (2) measured keeper goal/corner/Super Shot parity; (3) owned eight-direction glove/grip/release graphics; (4) reception/pass visuals and disjoint data provenance tooling; (5) career advice accessibility and stable-save controls. Physical handset and offline/PWA recovery certification, multiplayer and new arcade modes remain deferred.
