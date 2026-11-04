# Candidate 0.12.37.0 Node regression census — 2 November 2026

Source tree: `dev` at `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` plus the current uncommitted candidate integration.

`tests/full_regression_runner.py --category node --portable-browser` ran four independent shards. All **400/400 scripts passed** (100 per shard), with zero failures, timeouts or runner errors. Raw results and per-shard summaries are retained alongside this report.

The final integrated `PYTHONUTF8=1 npm run test:node` run passed **1,565/1,565** tests and the club census validated **32 clubs / 384 player slots**. Data validation passed for **223 teams, 2,676 players and 84 avatar presets**.

This is local working-tree evidence. Exact-commit CI, protected promotion, hosted Pages and physical-device acceptance remain separate.
