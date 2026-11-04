# Candidate 0.12.43.0 integrated local QA — 2 November 2026

This report covers the local `dev` worktree based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` plus its current uncommitted integration. No changes were committed, promoted, or deployed.

## Results

- `PYTHONUTF8=1 npm run test:node`: **1,575/1,575 passed**; generated roster census remains **32 clubs / 384 player slots**. Raw output: [`npm-test-node.log`](../qa_runs_012430_node/npm-test-node.log).
- Independent Node regressions: **404/404 scripts passed** across four shards; complete non-overlap audit passed. Reports: [`qa_runs_012430_node_independent_20261102`](../qa_runs_012430_node_independent_20261102/).
- Portable Chromium browser census: **160/160 scripts passed** across four shards with zero failures, timeouts, runner errors, or unrun scripts; complete non-overlap audit passed. Reports: [`qa_runs_012430_browser_20261102`](../qa_runs_012430_browser_20261102/).
- `tests/kits_contrast.test.cjs` checks all **223 team home/away pairs** and all **49,506 ordered matchups** of distinct source teams. The default home/away selections fall below 2:1 for 8,800 ordered matchups; a deterministic recommendation reaches at least 2:1 for every tested matchup while changing the fewest choices and preserving any combination that already passes. The minimum recommended ratio is **2.0049:1**.
- Desktop and simulated-touch `tests/kits_browser_qa.py` checks a real default-color clash, the accessible status and recommendation, explicit manual override, saved preferences reaching kickoff, and pause/resume. Both viewport modes pass without page errors.
- Data validator: **223 teams, 2,676 players, and 84 avatar presets passed**.
- `git diff --check`: passed; Git reports existing line-ending normalization notices.

## Remaining acceptance

This is local source-tree evidence only. Exact-head CI, protected promotion, Pages/hosted verification, physical-device/controller checks, perceptual match-scale kit readability, two-device LAN/network-loss acceptance, and owner visual approval remain separate. The candidate is not deployed.
