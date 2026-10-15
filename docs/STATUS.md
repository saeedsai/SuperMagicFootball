# Supermagic Football — CURRENT STATUS v0.8.25.31 (development branch)

This is a continuation of the v0.8.25.30 modular game, based on GitHub commit `34dd3d3` (main/dev before update). Development changes are isolated on `dev`. The base roster, gameplay physics defaults, 223 team indices, 2,676 players, 7 BPW squads, four action buttons, six formations and five main menu sections are unchanged.

**New feature:** Optional Performance HUD in Settings → Graphics shows live FPS and mean frame time over 500 ms during a match. Default OFF; menu/touch controls are unaffected, option stored with standard `legend_options` key. Game works without a HUD.

**Bugs/gaps resolved:** Hosted JSON fetch failures present retry instructions and a reload button; seven bounded physics tunables have moved from engine JS to `data/mechanics/gameplay.json` with previous coefficients as defaults; service worker cache version bumped. Older assertions fixed and new validation added.

**QA:** 143 Node tests, 20 inherited Chromium acceptance suites, 9 modular integration cases, 11 new performance/recovery Chromium cases and 24 deterministic match replays passed. All runnable tests 0 fail/timeout. Hosted Pages and actual device/browser-restart validation still outstanding. See `TEST_REPORT_v082531.md` and `QA_CATALOG_v082531.csv`.

**Playing:** A web server must serve `index.html`, `src/`, `data/`, `style.css`, `sw.js` as one rooted application. Github Pages URL is NOT asserted live. See `GITHUB_PAGES_SETUP.md` in repository root for branch source selection; `dev` is not production until published.

**Do not implement without approved milestone:** worldwide roster revision, Super Defense, Tricks or LAN/online.
