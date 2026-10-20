# SuperMagicFootball — hourly development agent checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-20

## Mission
Ship playable owner-priority UI/gameplay from latest GitHub `dev` with exclusive locks, safe saves/rosters/four controls, exact 4+4 Node/Chromium regression, then green-only automatic promotion to main and hosted Pages verification. No force pushes or safety bypass.

## Current checkpoint
**P0 FIX-UI-101 live:** `src/modules/ui.js` `14d7b6c3` aligns visible Back with keyboard/gamepad; Squad respects Customization parent; Controller Mapping returns to Input. Six Node tests plus desktop/sim-touch `tests/ui_back_routes_browser_qa.py` `145cec63`; halftime compatibility; docs `docs/UI_BACK_ROUTES_20261020.md`. UI claim released `3f109462`.
**P0 FIX-UI-102 live:** removed `DEV → ABOUT` home pill / ordinary menu dev hints `157100bd`; five Node tests `8e1e1956`, stale graphics test fixed `d8e5f455`, docs `docs/UI_HOME_BANNER_20261020.md`; UI claim released `3a6cdb74`. About live dev SHA/current commit and Recent Changes preserved.
**Legacy browser regression fixed:** `stats_browser_qa.py` `8c593af2`, `kits_browser_qa.py` `22e96c06` now assert Squad → Customization → Settings → Home, original game assertions retained; docs `docs/UI_LEGACY_BROWSER_ROUTES_20261020.md`; UI claim released `4c24f5fa`.
**SH01 playable zigzag:** analytic mirror/fade helper `cf61b82b`, real engine ball + matching GK prediction `3e25957c`, distinct Books 28/10 and Serpent 45/15 profiles `8fa1a703`; six Node cases `4ba59d7a`, Chromium real-game 12 cases each desktop/touch `24e947bd`. Missing browser fixture module fixed in `scripts/build.py` `4b005307`, offline `sw.js` cached new module `cb8a88cb`, legacy contract `28db5d20`, generated bundle regression `1e5a8b71`. Handover `docs/SHOTPATHS_LIVE_20261020.md` and `docs/SHOTPATHS_BUILD_HANDOVER_20261020.md`.

**Certified code checkpoint:** SHA `28db5d20d6ebb8cc08e60b96bf659a11ddae012f`, [Full Census #39487919601](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39487919601) PASS 351/351 Node preflight subtests, 158/158 Node scripts, 89/89 Chromium scripts in 4+4, desktop/sim-touch preview. Specific SH01, first-touch FPS, stats and kits browser cases PASS. Later docs/claim commits NOT yet exact-head certified or Pages-proven. No physical device QA.

Own locks all released: gameplay-engine `032d48b4`, integration-tooling `53c80246`, release-infra `efeb61f2`, qa-framework `4e02e670`, UI above. Issue #27 original missing CI trigger already resolved in workflow (all dev/main pushes, suites discovered); proposed extra static safeguard NOT published, issue still open. Other agent audio-feedback untouched.

## Next smallest action
Check latest `dev` SHA and exact final full 4+4 jobs; wait for green before main promotion and separate Pages hosted smoke. Correct only own CI failures. Then claim one small independent batch: 10 Career slots or counterable Super Defense. Six of eight authored visual character angles still absent.

## Ownership and exclusions
Only own memory file; never read/edit other agent memory. Preserve team/player IDs, saves, four controls, dynamic About SHA/commit summary pending coordinated four-number `0.9.0.0` release migration; never falsely claim deployed SHA from fetched latest dev.

## Evidence
[Full regression](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39487919601), [SH01](https://github.com/saeedsai/SuperMagicFootball/blob/dev/docs/SHOTPATHS_LIVE_20261020.md), [Actions](https://github.com/saeedsai/SuperMagicFootball/actions).

## Cleanup
Synthetic SH01 helper checkpoint superseded by live integration. QA/Pages checked separately.
