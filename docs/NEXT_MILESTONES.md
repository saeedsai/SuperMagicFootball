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

## 16 October 2026 — Spain national squad factual ages and heights (`NATIONAL-SPAIN-AGE-HEIGHT-B1`)

The first **national-team metadata correction** is landed in `data/players/national26.json` for Spain (`national26_0`). Pedri's incorrect age 33 was replaced with **23** (DOB 25 Nov 2002) and Gavi's incorrect 30 with **22** (DOB 5 Aug 2004), both as of 16 Oct 2026. Official FC Barcelona profiles confirm **174 cm** height for both. No names, team indices, roster IDs/order, shirt numbers, 2 GK / 3 DF / 4 MF / 3 FW roles, ratings, club data, game controls, graphics or saved-game schema were modified. New Node and actual Chromium desktop/touch runtime tests verify raw data and playable `rosterFor`/game-roster mapping. See [NATIONAL_SPAIN_METADATA_20261016.md](NATIONAL_SPAIN_METADATA_20261016.md).

**CI dependency:** The full census push trigger currently does not list the national data or these new test paths. The `release-infra` key is actively held by a graphics agent, so this feature does not edit its workflow. Core Modular QA runs automatically; full census must be certified on a later eligible exact source commit or by a future release owner. Generic hosted desktop/touch smoke is a separate gate.

**Next five small batches:** (1) Add national data and source-to-runtime acceptance paths to release-infra full-regression triggers and certify the complete census; (2) source-audit the next 2–3 Spain national ages/heights, while keeping the same per-team ownership; (3) measure true keeper outcome fairness across corners/nonlinear shots after its current owner completes; (4) advance illustrated modular player faces and animation with original fallback under graphics ownership; (5) improve halftime coaching and source-backed roster provenance validation under their own UI/integration locks. Physical iOS/Android, offline/PWA install/update, global squad authenticity and multiplayer remain separate milestones.

### Spain national factual metadata source/QA acceptance — 16 October 2026

The `NATIONAL-SPAIN-AGE-HEIGHT-B1` batch is **accepted** on exact integrated source `d9c7274`: [Full Regression Census #38898721461](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898721461) **171/171 PASS** (**111 Node + 60 Chromium**, all 8 shards green); [hosted PC and simulated-touch Quick Match #38891468528 attempt 4](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **SUCCESS**. Spain Pedri 23 (was 33), Gavi 22 (was 30), 174cm for both from FC Barcelona primary club profiles; all identities, tactical positions, rating and 32-national-team inventories remain unchanged. [Spain batch handover](NATIONAL_SPAIN_METADATA_20261016.md). Keep separate [release path-filter issue #2](https://github.com/saeedsai/SuperMagicFootball/issues/2) open until the release owner adds `national26.json` and national metadata tests to full-regression triggers. Physical phones and offline/PWA upgrade remain uncertified.

## 16 October 2026 — player-specific halftime fitness watch (UI-HALFTIME-FATIGUE-SPOTLIGHT)

**New bounded UI requirement:** the existing halftime coach notes now identify the two most fatigued *on-field* starters by name, shirt, position and current fitness; if more than two are below 40% fitness, the display reports the remaining count. Data is read from the per-team authoritative fatigue ledger, with editable names HTML-escaped. This improves substitution decision-making without automatic changes to engine physics, player IDs, controls, team talks, career data or saves.

Dedicated Node and live desktop/simulated-touch Chromium tests cover actual lineups, bench exclusion, fatigue ordering, thresholds, hostile editable names, state immutability and resuming play. See [UI_HALFTIME_FATIGUE_SPOTLIGHT_20261016.md](UI_HALFTIME_FATIGUE_SPOTLIGHT_20261016.md). **Certify the integrated commit**, not historic 171/171 regression.

**Next five small actions:** (1) exact-source full regression and hosted smoke, (2) seed-measure keeper corner/Super Shot fairness, (3) graphics-owner glove grip/distribution, (4) reception/pass animation and disjoint provenance tooling, (5) career/fitness coaching UX and stable saves. CI national triggers issue #2 is release-infra's scope.

## 16 October 2026 — Spain national goalkeeper source correction (B2)

**Delivered:** with exclusive `roster-national-national26_0` ownership, Spain team index 13's David Raya `national26_0_0` DOB 1995-09-15 now has **age 31 / height 183 cm**; Unai Simón `national26_0_gk_12` DOB 1997-06-11 now has **age 29 / height 190 cm** (age at 16 Oct 2026). Their previous ages were 22 and 24. Club/league primary profiles corroborate these facts. Existing team IDs, names, ratings, tactics, graphics, shirts, roles, 32 × 12 national inventory and the earlier Spain midfield corrections are unchanged. New source-data Node and real modular desktop/simulated-touch browser tests are committed. See [NATIONAL_SPAIN_GOALKEEPER_METADATA_20261016.md](NATIONAL_SPAIN_GOALKEEPER_METADATA_20261016.md).

**Gates:** [Modular QA #38900408270](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900408270) success on the new browser-test commit. Integrated complete regression [#38900429370](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429370) and deployed site must be certified independently by final exact-source results. **Issue #2 remains open** while `release-infra` is held by another agent: national source/test edits do not trigger a full census without an eligible concurrent code push. The national roster owner must not modify the active release agent's workflow.

**Next five bounded iterations:** 1. Fix national-team test/source CI path triggers when the release lock is available. 2. Audit 2–3 additional Spain national outfield player ages/heights from team/league primary records. 3. Review goalkeeper actual match contact/save fairness after prior physical lunge. 4. Finish directional illustrated gloves/faces and pass reception animations in disjoint graphics scope. 5. Extend halftime/coaching/lineup recommendations while keeping persistent saves and all four controls. Physical handset and PWA restart tests, historical arcade parity and multiplayer remain open.

### Spain national goalkeeper B2 completed and certified — 16 October 2026

The ages/heights of two Spanish goalkeepers were corrected from current club/league facts (David Raya 31/183 cm, Unai Simón 29/190 cm, as of 2026-10-16), with player IDs, original stats, ratings, squad order and other players intact. [Full regression #38900429370](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429370) **175/175 PASS** on integrated source `78b48056`: **113 Node + 62 Chromium**, including real Spain roster source/playable parity in desktop/simulated touch. [Public hosted PC/touch smoke #38891468528 attempt 5](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **SUCCESS**. [National keeper metadata source/QA handover](NATIONAL_SPAIN_GOALKEEPER_METADATA_20261016.md). **Issue #2** remains open until the independently claimed CI release owner adds national JSON/test push triggers. No physical handset, Safari or PWA-offline certification is implied. This batch's national-team claim is ready to release.

## 16 October 2026 — national roster source changes now trigger full regression (issue #2)

**Release gap fixed:** `data/players/national26.json` changes now launch the complete historical `Full Regression Census` on `dev` rather than only modular data checks. National-team-named Node/Chromium tests and the two established Spain metadata test sets also trigger full regression when modified individually. Added `tests/national_roster_regression_trigger.test.cjs` to prevent path filter regressions. Existing club, engine, art, QA and PWA triggers were preserved, and no game behavior or player data was edited. Code/test source [`06732676`](https://github.com/saeedsai/SuperMagicFootball/commit/067326766a647419529733897bf066ea05484758). [Detailed CI handover](CI_NATIONAL_ROSTER_TRIGGER_20261016.md). Modular QA [#38902247893](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38902247893) **passed** and full regression [#38902247781](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38902247781) automatically triggered; final cross-shard certification and hosted PC/touch smoke are independent release gates. Close [issue #2](https://github.com/saeedsai/SuperMagicFootball/issues/2) only on green integrated regression.

**Next five iterations:** 1) certify this eight-shard exact-source CI change and public browser smoke, close the issue, release ownership; 2) strengthen provenance-aware national roster age/height guardrails for new official-source batches; 3) verify a small sourced set of Spanish outfield players while preserving FC editorial ratings; 4) advance direction-safe graphics/reception animations under graphics ownership; 5) seed-calibrate real keeper outcomes and coaching/tactics accessibility under separate engine/UI locks. Physical phone, offline/PWA restart, Safari, original-content completeness and multiplayer remain unverified.

## 16 October 2026 — half-time tactics return context (UI-HALFTIME-TACTICS-RETURN)

**Small P1 fix:** Opening HOME/AWAY TACTICS during `HALF TIME` previously lost the one-time half-time team-talk/coaching menu on Back, Save or Restore Default by returning to generic PAUSED. The live Team Command Center now remembers whether it came from half-time and returns to that screen; when opened from ordinary PAUSED it still returns to PAUSED. Keyboard Escape/Backspace in Team Command Center uses its actual Back action instead of a stale navigation parent. No changes to gameplay, control mapping, squads, physics or saved-game schema. Explicit Save/Restore still write `teamPlans`, ordinary Back does not.

Five new Node contract tests and desktop/simulated-touch Chromium QA cover Back, Save, Restore, keyboard navigation, preserved team-talk access and normal pause. [Feature handover](UI_HALFTIME_TACTICS_RETURN_20261016.md). Fresh full-regression and hosted Pages smoke must be checked on actual integrated code, not on historical clean baseline.

**Next five small tasks:** (1) verify this exact-source full Node/Chromium regression and hosted desktop/touch game; (2) measure keeper corner/Super Shot fair outcomes; (3) improve eight-view glove grip/release with graphics ownership; (4) polish directional first touch/pass visuals and independently review source provenance; (5) expand save-compatible career/coaching UX. National-team CI filters and Arsenal FC27 metadata are separately claimed. Physical handsets, offline PWA, arcade parity and multiplayer remain pending.

### National roster full CI coverage certified and issue #2 closed

The **source-only national-team full-regression trigger gap is resolved** on `dev`, with [code/test commit `06732676`](https://github.com/saeedsai/SuperMagicFootball/commit/067326766a647419529733897bf066ea05484758). [Exact-source Full Regression Census #38902247781](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38902247781) **177/177 scripts passed** (**115 Node, 62 Chromium; 8 shards**, 0 errors/timeouts/skips). National data, prior Spain factual tests and future national-named tests now launch that census automatically; the new CI trigger contract passed. [GitHub issue #2](https://github.com/saeedsai/SuperMagicFootball/issues/2) is **closed** with full CI evidence. [Hosted PC and simulated-touch game smoke #38891468528 attempt 7](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **passed** after source deployment (224 teams, menu/selection/kickoff/active match). See [technical acceptance and handover](CI_NATIONAL_ROSTER_TRIGGER_20261016.md).

**Next five iterations after release:** (1) audit source-based national-player metadata with isolated ID-preserving batches; (2) guard current FC27/editorial provenance and roster compatibility during concurrent agent merges; (3) calibrate organic keeper saves vs corners/Super Shots; (4) continue editable illustrated keeper/character animation and passing follow-through; (5) deepen halftime coaching/career advice with preserved saves. For release quality, add physical iOS/Android/Safari, PWA offline/reinstall/restart and long-running frame-rate tests as separate scoped acceptance. No old QA/provenance files were deleted because the tree audit found no tracked scratch.

## 16 October 2026 — seeded live-AI goalkeeper corner and nonlinear Super Shot calibration

The keeper fairness QA gap now has two complementary, **non-invasive** browser cohorts. The inherited 144 shot fixtures per device still isolate real contact geometry; the new 96 fixtures per device additionally advance **actual goalkeeper/player AI and ball flight together** at 30/60/120 FPS in mirrored goals, with fresh/tired keeper and normal or nonlinear zigzag Super Shots at two near-corner aim lanes. The suite counts real goals/saves, bounded contacts, AI invocations and travel; it requires duplicate-seed repeatability, rejects duplicate saves and wrong-sided keeper events, and reports (rather than conceals) mirrored outcome mismatches. All 118 active Node contracts pass in the checked source run, but full Chromium browser certification remains separate; see [keeper live-AI handover](KEEPER_LIVE_AI_FAIRNESS_20261016.md). No change to keeper reach, AI physics, graphics, roster or game input.

Next five: (1) certify the integrated 8-shard census and measure any real-AI mirrored/save outcome gap; (2) only with evidence, tune one targeted keeper corner/zigzag trajectory behavior under gameplay ownership; (3) illustrated directional keeper glove hold/distribution under graphics owner; (4) first-touch/pass follow-through and source-provenance validation in disjoint scopes; (5) accessible halftime/career fitness coaching and physical mobile/PWA validation. Offline/PWA and multiplayer remain deferred.
