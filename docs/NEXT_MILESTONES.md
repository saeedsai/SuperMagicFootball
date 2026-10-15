# SuperMagic Football — five-iteration development plan (multi-agent integrated)

**Source of truth:** latest `dev` branch, and exact git commit on which every QA run executes. As of 15 October 2026, concurrent roster and graphics agents had already integrated their changes into `dev`; their subsequent FC27 source-probing and comparison-image commits must not be overwritten. Preserve 223 teams, 2,676 players, seven BPW squads, all persistent IDs and stable team indices, 2GK/3DF/4MF/3FW, five main menu groups, four action buttons, six formations, and existing save schema.

| Next iteration | Focus | Implementation and acceptance |
|---|---|---|
| **v0.8.25.33** | Player graphics quality | Named-player front/side/three-quarter/rear visual QC using live contact sheets; resolve hair, beard, face, accessory overlap and expression issues; render entire real-player matrix and Chromium art suite. |
| **v0.8.25.34** | Gameplay JSON parameters | Add bounded, documented pass/contact/keeper tuning keys; preserve previous defaults; validate schema, effects and 24 seeded complete matches. |
| **v0.8.25.35** | Gameplay animation | Improve keeper recovery, first touch, passing and action follow-through, including directional frame consistency; maintain current collision and ball physics unless calibrated separately. |
| **v0.8.25.36** | Parallel data/editor integration | **Foundational three-way conflict checker delivered early**: extend it with proposed-diff summaries and cross-graphics editor validation, then implement reviewed merges without ID/index drift. |
| **v0.8.25.37** | Career, roster and tactical coaching UX | Better squad maintenance and tactical feedback without breaking user-created clubs or saves; new UI and regression acceptance. |

## Current integration/QA hygiene

Run `scripts/parallel_data_merge.py` with three checkout trees when multiple agents edit the same JSON, follow [PARALLEL_DATA_MERGE_GUIDE.md](PARALLEL_DATA_MERGE_GUIDE.md), and require GitHub `Modular Game Dev QA` and `Full Regression Census` green on the exact integrated commit. Do not force-push or cherry-pick changes already in current `dev`. Old docs, QA evidence and agent workflow files are historical or independently owned: clean only proven-unused artifacts.

## Far-future backlog — owner-deferred

- Complete GitHub Pages interactive gameplay, refresh/import/export and browser-process save persistence certification.
- Physical Android/iOS devices, performance/FPS tuning on devices, offline/PWA and install certification.
- Worldwide team roster research, Super Defense, Tricks and multiplayer/network architecture, until explicitly rescheduled.

Routine GitHub Pages build/deployment reporting continues, but is **not** a substitute for real browser interaction and is **not** a development priority.
## Pitch dimension requirement fulfilled (15 October 2026)

One new owner-requested requirement: increase the playable field length **20%** while keeping pitch width, goal mouth size, world end margins and gameplay controls stable. Implemented in `data/mechanics/gameplay.json` with new geometry, browser camera and Node contract checks. Next five graphics/mechanics/animation/parallel-data/career priorities above stay intact; near-term hosting/restart persistence and physical mobile/PWA certification remain owner-deferred.
