# SuperMagicFootball local Node QA

**Date:** 1 November 2026  
**Package candidate:** 0.12.24.0  
**Source:** local uncommitted tree based on `dev` parent `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`

| Gate | Result |
|---|---:|
| `npm run test:node` (build + full CJS Node suite + club parity) | **PASS — 1,463/1,463** |
| Independent Node regression census | **PASS — 371/371** (four shards) |
| Data validation | **PASS — 223 teams, 2,676 players, 84 avatar presets** |

The full suite required `PYTHONUTF8=1` for the Windows Python runner. Per-shard JSON and Markdown reports are alongside this README. This is local source-tree verification, not exact-commit CI, protected promotion or hosted deployment.
