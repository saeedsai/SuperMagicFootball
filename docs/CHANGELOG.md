## v0.8.25.32 — eight-view Studio gallery and rear hairstyle fix (2026-10-15)
- Implemented optional compare-all-eight-views gallery in Player Customization; cached idle portraits update with unsaved visual controls without mutating save data.
- Corrected hair drawing order: 3 visually identical straight-back hairstyles now have unique realistic crown marks; distinct count 11/13 → 13/13, all other view families preserved.
- Added 3 Node and 18 Chromium cases with face/hair and form-preservation assertions; refreshed graphics contact sheet.
- Completed 146 Node, 20 inherited browser suites, 9 modular, 11 loader/performance, 18 new gallery and 24 full scripted matches, all PASS in executed suites. Historical and physical/hosted checks NOT EXECUTED.
- Updated current status, test catalog, gap register, plan. Moved requested hosting/save and physical mobile/PWA initiatives to FAR FUTURE.

## v0.8.25.30 — 2026-10-15 — JSON and ES module parallel development split

- Split inherited `src/game.js` into 28 independently editable JavaScript modules with async `src/assets.js` JSON bootstrap and playable multi-file `index.html`.
- Migrated original data to 223 team records, seven player shards with 2,676 players, separated procedural graphics palettes and 84 BPW avatar presets. Preserved existing team, player, formations and saves.
- Moved AI profiles, formations, dribble styles, shots, special move definitions, ball catalog, studio choices, pitch world geometry and five engine timing constants into active JSON configuration.
- Added active data integrity validator, source numeric audit (audit-only), modular browser integration, 8 new Node tests, and legacy QA fixture builder. Removed redundant root standalone file and stale current handover descriptors; historical material archived.
- Fresh 138 Node PASS; 21 inherited Chromium suite PASS; 9 direct modular browser PASS; 24 full scripted-match PASS; 3 origin/hardware NOT EXECUTED.
- Roadmap, QA catalog, graphics registry, gaps and parallel coordination plan updated. Deferred feature milestones unchanged.

---

# Changelog

## v0.8.25.29 Alpha — 2026-10-15
- Continued directly from complete v0.8.25.28 editable source; no clean-sheet rewrite or approved roster changes.
- Added `faceViewProfile` with five jaw/cheek/chin/forehead contours for side, front-quarter and back-quarter views; the front head outline remains intact.
- Authored rear-view hair crown and ponytail silhouettes to give short/swept hairstyles more profile distinction.
- Hardened Player Studio persistence: write/readback confirmation, attempted rollback after storage failure, truthful failure feedback. Old `legend_` save containers and named-player Clean Shave semantics retained.
- Added 5 Node tests and 13 Chromium checks, 8-direction named-player contact sheet and explicit real-origin NOT EXECUTED cases.
- Completed 130 Node and 337 Chromium PASS checks (including 24 complete scripted games) with zero failed/timed-out individual tests; 6 external/hosted-origin checks NOT EXECUTED.
- Updated source identifiers, service-worker cache version, specifications, status, roadmap, gap register, QA catalog and release manifests.

## v0.8.25.28 Alpha — 2026-10-15
- Fixed named-player forced beards overriding Player Studio Clean Shave.
- Preserved authored/preset beards as defaults through `avatarFor` while respecting explicit selection.
- Made stubble colour follow the player's natural hair tint instead of using fixed grey marks.
- Added 6 Node tests and 11 browser acceptance checks; tested 5 face families × 5 beard choices × 8 directions on desktop and touch.
- Reviewed a 125-cell facial hair contact sheet and re-ran the inherited graphics, controls, goalkeeper, field/shot and full-match suites.
- Refreshed the QA catalog, roadmap, gap register and release assets.

## v0.8.25.27 Alpha — 2026-10-15
- Smoothed stop/start gait phase and ensured a grounded two-foot resting pose.
- Added visual first-touch bracing dependent on nearby defender pressure.
- Added goalkeeper short-throw arm extension and long-punt leg preparation using existing actions.
- Added five Node and ten Chromium regression checks.
- Updated release/version-specific graphics QA guard assertions.
- Re-ran full inherited gameplay, graphics, keeper and match-replay suites: 428 PASS, 0 FAIL, 0 TIMEOUT; three external categories remain not executed.
- Updated QA catalog, current roadmap, gap register and essential release docs; archived the prior catalog and report.

## Previous history

## v0.8.25.25 (2026-10-15)
- Fixed live goalkeeper dive → recovery discontinuity with shared visual endpoints.
- Added visual recovery after successful diving catch and ownership-gated glove contact feedback.
- Resolved two keeper-dive compact-frame clipping failures found by inherited graphics QA without changing collision physics.
- Added 7 Node tests and 9 Playwright keeper animation acceptance checks.
- Completed 413 regression checks, including 24 full matches, graphics integration, and 108-player 8-view stress QA.
- Updated development docs, version labels, PWA cache revision, save export metadata, source archive and current QA catalog.

## Previous release
v0.8.25.24 release status, changelog and QA are retained under `docs/history/v082524/`.

## v0.8.25.31 — GitHub dev incremental maintenance (2026-10-15)
- New opt-in Graphics → Performance HUD (rolling FPS and mean frame time, desktop and phone, default disabled; `legend_options` persisted).
- Externalized seven attack stoppage, knockback and keeper prediction parameters to `data/mechanics/gameplay.json` at unchanged default values.
- Replaced misleading loader error panel with hosted/offline recovery instructions and a RETRY LOADING button.
- Rotated service-worker cache; added five Node tests and eleven browser checks; updated inherited version expectations.
- All 143 Node, 20 inherited Chromium suites, 9 modular checks, 11 new checks and 24 full-match replays pass. Live GitHub Pages dev delivery remains unverified pending site settings.
- Added modular validator, builder, QA files and dev CI workflow; historic root packaging removed from dev only.