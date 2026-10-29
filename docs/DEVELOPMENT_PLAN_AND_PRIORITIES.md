> **29 October 2026 — 0.12.2.0 BROADCAST-GOAL-01 candidate:** New original goal celebration graphics, dynamic scorer/score banner, confetti and running turf-contact effects advance the Mini Football-inspired visual work. Physics, four actions, saved data, 223/2676 roster, Career/Cup and SD09 unaffected. Full bespoke eight-view character artwork remains a major active milestone. [Roadmap](MINI_FOOTBALL_VISUAL_ROADMAP_20261029.md).

> **29 October 2026 — ARENA-OVERHAUL-01 candidate (0.12.0.0)**: Owner requested one-pass original arcade menu/HUD/graphics rework. Broad UI and renderer implementation committed on existing dev; current exact-head CI and hosted acceptance must be independently verified. The remaining bespoke eight-view art/animations, goalkeeper/game feel and real mobile screenshot acceptance are active follow-ups. Keep the 223/2676 roster, six formations, exactly four controls, offline saves and safe release gates. See [visual roadmap](MINI_FOOTBALL_VISUAL_ROADMAP_20261029.md).

> **Current owner priority (29 October 2026): Mini Football-inspired visual and UX transformation.** The authoritative ordered six-milestone specification is [MINI_FOOTBALL_VISUAL_ROADMAP_20261029.md](MINI_FOOTBALL_VISUAL_ROADMAP_20261029.md). Begin with VIZ-01 four-button mobile match HUD/joystick polish; then VIZ-02 menus, VIZ-03 independently authored eight-direction characters/animation, VIZ-04 pitch/camera/stadium, VIZ-05 Player Studio and VIZ-06 gameplay feel/QA. This supersedes only older visual-priority sequencing, not release/security gates, rosters, offline saves or exactly four action controls. Reference Mini Football for polished arcade UX, never copy its proprietary artwork or branding. Physical LAN issue #48 and Render trigger drift #86 remain separate open work.

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

## Gameplay-request priorities added 16 October 2026

The owner has explicitly prioritized: (1) slightly lower Super Shot speed and slightly higher fatigue cost, (2) more active goalkeeper diving and (3) holding a caught ball in the goalkeeper's hands. This iteration delivers the first item as a 4% launch-speed reduction and 8% nominal cost increase via bounded JSON, and an initial hand-catch/hold feature using existing possession and distribution. Keepers' ordinary dive activity is **not yet tuned**; it is the next highest-priority iteration because prior fairness fixes restricted contact to near the keeper's real depth plane. Use seeded and mirrored gameplay, not wider early-hitboxes. See `docs/SUPER_SHOT_KEEPER_HANDS_20261016.md`.

Deliver one or two small changes per iteration; take checkpoints between commits; recheck latest `dev` immediately before applying each batch; run preflight, full Node and Chromium census, exact-commit GitHub Pages deploy and hosted desktop/touch smoke; report actual checks not historical totals.

## Focused keeper dive activity — 16 October 2026

The master requirements and original M0–M10 gates were re-read alongside the currently active modular plan. The 218-row historical matrix currently labels 41 Done, 120 Partial and 57 Missing; these are **inventory labels**, not a fresh test-by-test certification, because recent code has moved ahead of the matrix. A new scope reconciliation is in [REQUIREMENTS_REVIEW_20261016.md](REQUIREMENTS_REVIEW_20261016.md).

**Delivered code checkpoint:** `src/modules/engine.js` now initiates a non-contact goalkeeper dive animation early for predicted credible inbound attempts and records `keeperDiveAttempt` once with a 1.25s intent guard. Players and balls do not jump to predicted coordinates and the actual goalkeeper save/contact checks, special shot rates and match controls are unchanged. Real auto-save still depends on physical contact. Includes a targeted 30/60/120Hz mirrored desktop/touch browser test and Node guard tests; the complete regression result and hosted site smoke must be checked on the appropriate commit.

**Still open:** physiological/physical diving reach and keeper save-rate tuning, richer eight-view grip poses, Super Shot goal-rate calibration, original-game mode parity, player likeness and metadata provenance, career/tactics improvements, device matrix, advanced specials and online mode. Continue small batches only, with deployment and full regression gates.

## 16 October 2026 — goalkeeper effectiveness measurement, no speculative hitbox changes

The next step after the existing visual early keeper dive was implemented in `src/match_telemetry.js` rather than editing `src/modules/engine.js`: keep each shot's keeper anticipation event independent of its real goalkeeper physical contact, with direction-specific and Super Shot breakdowns. Reporting an attempt is no longer conflated with recording a save. Added `tests/keeper_dive_telemetry.test.cjs` and a full-regression workflow trigger, with 66 active Node tests and 17 merge guards passing in exact-source Modular QA `38881038084`. The full historical census is tracked separately at `38881038162`; check actual completion before citing totals. Planned next milestone: seeded live-shot sample coverage, then keeper glove/release art, reception/pass animation, source-aware merge provenance, career/tactics. No roster or save format modifications.

## 16 October 2026 — single bounded goalkeeper calibration step

Added deterministic modular browser-replay acceptance covering mirrored keeper direction, corner scoring, normal/Super Shot class, high GK fatigue and frame-rate effects. The fixture uses the actual engine release/flight/contact functions and events; no gameplay coefficients were modified without validated evidence. Exact CI for `c95ce47` is authoritative. Subsequent plan: evaluate the measured misses, select at most one physical improvement, then keeper glove poses, pass receptions, concurrency reviews and career/tactics UX. Temporary build/test output is now ignored; earlier QA archives and other agents' source assets remain retained.

### Keeper calibration regression checkpoint certified

The reproducible real-engine browser matrix on `06c0b30b` passed all four Chromium shards (52/52) and all four Node shards (97/97) in [Full Regression Census #38883629200](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38883629200). Documentation and `.gitignore` hygiene were updated without deleting older releases or concurrent workstreams. Do not tune real keeper reach until the collected match-level evidence is evaluated. See `KEEPER_SEEDED_CALIBRATION_20261016.md`.
