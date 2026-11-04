# Candidate 0.12.81.23 browser census — 4 November 2026

The portable browser runner discovered all **229 browser scripts** and distributed them across four non-overlapping shards. Every script passed, with no failures, timeouts, runner errors, or unrun cases:

- Shard 1: **58/58 passed**
- Shard 2: **57/57 passed**
- Shard 3: **57/57 passed**
- Shard 4: **57/57 passed**

`tests/audit_regression_shards.py` verified that all 229 discovered scripts were selected exactly once and passed. The report is local portable-Chromium evidence labeled `local`; it is not exact-head CI, hosted, physical-device, or owner acceptance.
