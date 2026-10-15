# Supermagic Football — current development status v0.8.25.32

Authoritative base: GitHub `dev` commit `d44cb954554e344bcc02e1b8f582c2e8b21a68a8` (v0.8.25.31). Development remains modular: root `index.html` plus `src/`, `data/`, `style.css`, `sw.js`. No standalone root `play.html` needed.

**New requirement delivered:** The Player Studio **COMPARE ALL 8 VIEWS** control displays an eight-image grid reflecting hairstyle, face shape, beard and accessories as the editor changes. It is off by default, uses a cached idle pose, preserves uncommitted editor controls, and changes no gameplay or saved data. Live player customization continues to use prior save formats and keys.

**Graphics bug fixed:** Straight-behind variants for hairstyles 0, 9, 12 were pixel-identical (11/13 unique). Adding visible rear-crown details after the generic hair overlay raised uniqueness to **13/13** across desktop/simulated touch. All eight views and 5 face families continue to render.

**Regression:** 146/146 Node assertions, all 20 inherited Chromium suites, 9 modular loading checks, 11 performance recovery checks, 18 new Studio gallery checks, 24/24 complete seeded matches; zero FAIL or TIMEOUT in executed suites. 19/19 graphics integration checks and its 12,096-case sweep passed. See `TEST_REPORT_v082532.md`, `QA_CATALOG_v082532.csv` and `QA_SUMMARY_v082532.json`.

**Deferred per owner:** exhaustive hosting/reload/saved profile certification and physical mobile FPS/PWA/offline testing have moved to FAR FUTURE, not next-five milestones. Routine GitHub publish-status checks remain. Hosted interactive browser testing was not executable in this environment; do not confuse successful GitHub Actions builds with it.

**Protected:** 223 built-in teams, 2,676 players (12/team), BPW squads and player IDs, 2GK/3DF/4MF/3FW, four action buttons, five nav groups and six formations, career save schema and gameplay physics unchanged.