# Candidate 0.12.81.20 browser census — 4 November 2026

The portable Chromium full-regression runner discovered **229 browser scripts** and selected them into four disjoint shards. All shard scripts completed without failures, timeouts, runner errors or unrun cases:

- shard 1: **58/58 passed**
- shard 2: **57/57 passed**
- shard 3: **57/57 passed**
- shard 4: **57/57 passed**

`python -X utf8 tests/audit_regression_shards.py --reports docs/qa_runs_012820_browser_20261104 --category browser --expected-shards 4 --expected-commit local --out docs/qa_runs_012820_browser_20261104/audit.json` independently verified all 229 unique discovered scripts were selected exactly once and passed. This is a local portable-Chromium census labeled `local`, not exact-head CI, hosted, physical-device, or owner acceptance.
