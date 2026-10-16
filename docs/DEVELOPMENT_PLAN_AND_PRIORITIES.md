# Development priorities — v0.8.25.32

Baseline: latest inspected GitHub `dev` SHA `d44cb954554e344bcc02e1b8f582c2e8b21a68a8`; continue modular source; no clean-sheet rewrite, no unrequested squad or mechanic changes.

**Completed in this iteration**
1. Added opt-in Player Studio eight-view comparison grid with on-edit refresh, stable unsaved controls, and cached static gallery renders.
2. Fixed rear-hair layer order hiding the distinguishing detail of styles 0, 9, 12: unique straight-back signatures from 11/13 to 13/13.
3. Added three structural Node tests and 18 Playwright desktop/simulated touch acceptance checks, including no-save, unsaved-form preservation and full rear hairstyle matrix.
4. Ran 146 Node, 20 inherited browser suites, 9 modular, 11 performance/loader, 18 new Studio, 24 scripted matches; all executed suites passed. Refreshed QA evidence and visual comparison screenshot.
5. Kept root folder limited to live HTML/CSS/JS and current docs; generated single-file test fixture remains under tests/.generated only and is not a public standalone game.

**Current priorities**
- P0: eight-view graphics polish and named player likeness; cosmetic QA without disturbing squad or save schemas.
- P1: controlled gameplay parameter JSON extraction with semantic validation and physics parity.
- P2: animation refinement, parallel-data merge conflict checking, career/editor UI.
- FAR FUTURE (per owner): exhaustive hosting/save/restart certification and physical mobile/real FPS/offline/PWA tests. Do not silently reinsert them into the near-term schedule.
- Deferred: complete real-world roster database audits, Super Defense, Tricks, LAN/online.

See `NEXT_MILESTONES.md` for five iterations, `GAP_REGISTER_v082532.md` for open gaps and `TEST_REPORT_v082532.md` for verified regression evidence.
## Owner-requested pitch extension — implemented in this cycle

- Field length increased precisely from 1,884 to 2,260.8 world units (+20%). Width stays 1,220; match world width grows 2,184 → 2,560.8 so left/right margins stay equal.
- All normal kickoff, formation, goal and renderer references use the JSON world. Added Node and Chromium regression; world dimension invariant also validates in CI. No alteration to player/squad data, save schema or physics multipliers.
- Next iterations remain graphics polish, gameplay JSON extraction, match animation, concurrent editing validation, career/tactics; physical mobile/PWA and exhaustive hosting/persistence certification remain far-future.

## v0.8.25.34 — completed on 16 October 2026
- Created independently owned `src/modules/physicsbalance.js`; bounded pure-function pass-speed and keeper-recovery calculations, validated against current JSON values.
- Moved 10 previously hard-coded coefficients to `physicsTuning` while retaining their exact old gameplay defaults. Rotated cache and updated modular fixture build order.
- Added unit parity/editability/invalid-input tests, browser desktop/touch pass and keeper tests, and a fresh full-regression CI trigger. Existing physical-device/Pages persistence scope remains far future.
- Next five active iterations: animation → parallel editing safeguards → career/tactics UX → player art refinement → further validated mechanics controls.

## 16 October 2026 — parallel-edit index guard and preview

Closed a reproducible merge-safety gap: a same-ID, same-order `data/teams.json` edit could change a numeric team `index`, even though UI and saves rely on the index remaining stable. The three-way JSON checker now blocks unilateral and matching two-sided index rewrites, and adds bounded, per-agent and merged field-change summaries to CLI dry-run reports. Three targeted Python regressions plus the current Python and full Node/Chromium CI are required to release. This tools-only requirement is a partial early delivery of milestone v0.8.25.36; planned game animations and parallel-editor integration remain open.
