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
