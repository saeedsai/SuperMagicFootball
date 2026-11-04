# Candidate 0.12.41.0 integrated local QA — 2 November 2026

This report covers the local `dev` working tree based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` plus the current uncommitted integration. Results are local only; nothing was committed, promoted, or deployed.

## Results

- `PYTHONUTF8=1 npm run test:node`: **1,573/1,573 passed**; generated roster census remains **32 clubs / 384 player slots**. Raw output: [`npm-test-node.log`](../qa_runs_012410_node_20261102/npm-test-node.log).
- Independent Node regression: **403/403 scripts passed** across four shards; non-overlap audit passed. Reports: [`qa_runs_012410_node_independent_20261102`](../qa_runs_012410_node_independent_20261102/).
- Portable Chromium browser census: **160/160 scripts passed**, zero failures, timeouts, runner errors, or unrun scripts across four shards; non-overlap audit passed. Reports: [`qa_runs_012410_browser_20261102`](../qa_runs_012410_browser_20261102/).
- Data validator: **223 teams, 2,676 players, and 84 avatar presets passed**.
- VIZ-05 focused gamepad tests pass **2/2**. Desktop and simulated-touch Chromium coverage verifies left/right one-step adjustment of Player Studio selections and its action-gallery range slider with focus retention, boundary focus movement, A activation, B Back, unsaved-change cancellation, save and persistence after reload. Both profiles also cover Manager Appearance selection adjustment and A activation. Physical-controller acceptance remains open.
- Candidate `.40` evidence retains the prior selection-only roundtrip and integrated report: [`0.12.40.0 QA`](../qa_runs_012400_integrated_20261102/README.md). The `.41` runtime change modifies no game data or Studio assets.
- `git diff --check`: passed; Git reports existing line-ending normalization notices.

## Remaining acceptance

This is local source-tree validation. Exact-head CI, protected promotion, Pages/hosted verification, physical-device and physical-controller checks, two-device LAN/network-loss acceptance, and owner visual approval remain separate. The candidate is not deployed.
