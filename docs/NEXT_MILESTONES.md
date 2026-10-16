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
