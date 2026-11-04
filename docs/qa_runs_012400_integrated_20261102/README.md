# Candidate 0.12.40.0 integrated local QA — 2 November 2026

This report covers the local `dev` working tree based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` plus the current uncommitted integration. Results are local only; nothing was committed, promoted, or deployed.

## Results

- `PYTHONUTF8=1 npm run test:node`: **1,573/1,573 passed**; generated roster census remains **32 clubs / 384 player slots**. Raw output: [`npm-test-node.log`](../qa_runs_012400_node_20261102/npm-test-node.log).
- Independent Node regression: **403/403 scripts passed** across four shards; non-overlap audit passed. Reports: [`qa_runs_012400_node_independent_20261102`](../qa_runs_012400_node_independent_20261102/).
- Portable Chromium browser census: **160/160 scripts passed**, zero failures, timeouts, runner errors, or unrun scripts across four shards; non-overlap audit passed. Reports: [`qa_runs_012400_browser_20261102`](../qa_runs_012400_browser_20261102/).
- Data validator: **223 teams, 2,676 players, and 84 avatar presets passed**.
- VIZ-05 focused gamepad tests pass **2/2**. Desktop and simulated-touch Chromium coverage verifies left/right selection changes while focus remains on the selector in both Player Studio and Manager Appearance, selector focus, A activation, B Back, unsaved-change cancellation, save and persistence after reload. Physical controller acceptance remains open.
- Previous integrated work remains documented in the [0.12.39.0 report](../qa_runs_012390_integrated_20261102/README.md), including AssetStudio manifest/source validation, VIZ-01/02 responsive/touch audits and LAN30 local signaling-outage/synthetic ICE evidence. This `.40` change modifies no game data or Studio assets.
- `git diff --check`: passed; Git reports existing line-ending normalization notices.

## Remaining acceptance

This is local source-tree validation. Exact-head CI, protected promotion, Pages/hosted verification, physical-device and physical-controller checks, two-device LAN/network-loss acceptance, and owner visual approval remain separate. The candidate is not deployed.
