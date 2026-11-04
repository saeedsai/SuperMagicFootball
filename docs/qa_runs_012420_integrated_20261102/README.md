# Candidate 0.12.42.0 integrated local QA — 2 November 2026

This report covers the local `dev` working tree based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` plus the current uncommitted integration. Results are local only; nothing was committed, promoted, or deployed.

## Results

- `PYTHONUTF8=1 npm run test:node`: **1,574/1,574 passed**; generated roster census remains **32 clubs / 384 player slots**. Raw output: [`npm-test-node.log`](../qa_runs_012420_node_20261102/npm-test-node.log).
- Independent Node regression: **404/404 scripts passed** across four shards; non-overlap audit passed. Reports: [`qa_runs_012420_node_independent_20261102`](../qa_runs_012420_node_independent_20261102/).
- Portable Chromium browser census: **160/160 scripts passed**, zero failures, timeouts, runner errors, or unrun scripts across four shards; non-overlap audit passed. Reports: [`qa_runs_012420_browser_20261102`](../qa_runs_012420_browser_20261102/).
- Data validator: **223 teams, 2,676 players, and 84 avatar presets passed**.
- VIZ-04 audit verifies at least **2:1 relative-luminance contrast** between each team's generated home and away primary colors. The minimum observed ratio is **2.0604:1** across 223 teams. The source secondary remains when it meets the threshold; otherwise the deterministic high/low fallback is selected. Home colors, team IDs, rosters, gameplay and saves are unchanged. See [VIZ04_KIT_CONTRAST_20261102.md](../VIZ04_KIT_CONTRAST_20261102.md).
- VIZ-05 gamepad select/range-slider improvements and Player Studio/Manager Appearance acceptance remain covered by the [0.12.41.0 integration report](../qa_runs_012410_integrated_20261102/README.md).
- Inter Milan source audit adds 42 direct official field observations across 12 stable FC27 IDs. 30 fields remain unresolved; no roster values or tiers changed. See [Inter Milan audit](../RATING_TIER_BATCH_AUDIT_INTER_MILAN_20261102.md).
- `git diff --check`: passed; Git reports existing line-ending normalization notices.

## Remaining acceptance

This is local source-tree validation. Exact-head CI, protected promotion, Pages/hosted verification, physical-device and controller checks, opposing-team kit-clash/perceptual review, two-device LAN/network-loss acceptance, and owner visual approval remain separate. The candidate is not deployed.
