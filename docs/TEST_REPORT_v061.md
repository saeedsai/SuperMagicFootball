# Test report — Supermagic Football v0.6.1
Date: 2026-10-13. Baseline: v0.6.0 source.

| Test | Result | Coverage |
|---|---|---|
| `npm test`: `simulation.mjs` | PASS | Classic shot table, physics, goals, penalty init |
| `npm test`: `career.mjs` | PASS | Transfers, training, schedules, 12-player contracts, season rollover |
| `npm test`: `continental.mjs` | PASS | All 151 competition slots through tournament completion |
| `npm test`: `ai_difficulty.mjs` | PASS | Five presets, level 0 bug, CPU speed/response/aim, keeper, 7,500 ticks finite |
| `npm run qa`: `v060_qa.py` | PASS desktop + simulated mobile | Continental menus and match progression |
| `npm run qa`: `manager_v060.py` | PASS desktop + simulated mobile | Recruitment and contracts |
| `npm run qa`: `save_filter_v060.py` | PASS desktop + simulated mobile | Filtering and saved JSON file flow |
| `npm run qa`: `ai_browser_qa.py` | PASS desktop + simulated mobile | Settings, pre-match difficulty, live difficulty, pause/resume |
| JS syntax, one-file build | PASS | `node --check`, offline `play.html` bundle |

**Limitations**

- QA is headless Chromium; mobile is viewport/touch simulation, not a physical device.
- The browser disallows navigation to localhost and `file://`. New UI QA uses `page.set_content` and a minimal `localStorage` stand-in to test option save handlers. This does not prove real disk persistence across browser restarts.
- No physical controller testing, AI win-rate calibration, cross-browser or network gameplay testing.
- Passing regression tests is not equivalent to Nintendo-original feature parity.
