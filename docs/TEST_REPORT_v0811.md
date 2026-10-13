# Supermagic Football v0.8.11 — tested release report

**Scope:** Visual character renderer only; no intentional change to gameplay mechanics, roster or save structure.

- Standalone build: `npm run build` **PASS** (self-contained offline HTML). `node --check` **PASS**.
- Node regression: **20/20 PASS** — 19 previously shipped suites + new `character_art.mjs`.
- New browser QA: **2/2 PASS** (desktop Chromium and simulated Android) for all 13 hair silhouettes in a gallery, initial game match drawing, and no JS page exceptions.
- Legacy browser QA: **19/19 PASS** on individual execution. Five tactics/career tests, five AI/stats/morale tests, five aerial/control/collision tests, and four four-button/dribble/penalty/menu tests were run in bounded groups.
- **Intermittent result preserved:** `four_button_phase2_browser_qa.py` first passed desktop but **failed simulated Android** (flying-kick event timing) in a combined batch; immediately rerunning the unchanged script in isolation **PASSED on both**. Therefore the result is **19 legacy scripts pass with a known intermittent test**, not a flawless first-run result.
- Data integrity: `src/engine.js`, `src/data.js`, `src/expanded.js` SHA content matches v0.8.10 (see hashes below). Browser save compatibility not modified; earlier save tests passed in the legacy suite.
- Coverage gaps: No real physical mobile/gamepad, performance profiles or actual human likeness recognition tests; snapshot gallery is a basic visual QA artifact, not a final art direction certification.

```json
{
  "render.js": "422877f244342dcf224fa69b49e25b5ab943341085bca510e925f5a22d9556e5",
  "engine_same": true,
  "teams_same": true,
  "roster_same": true
}
```
