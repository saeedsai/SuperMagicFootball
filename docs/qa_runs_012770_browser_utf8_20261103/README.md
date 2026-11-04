# Candidate 0.12.77 portable Chromium census

Date: 3 November 2026. Four portable-Chromium regression shards ran on the `.77` local fixture with `PYTHONUTF8=1`; the regression-shard audit passed.

| Shard | Pass | Fail | Timeout | Error |
|---|---:|---:|---:|---:|
| 1/4 | 53 | 0 | 0 | 0 |
| 2/4 | 53 | 0 | 0 | 0 |
| 3/4 | 53 | 0 | 0 | 0 |
| 4/4 | 52 | 0 | 0 | 0 |
| Total | 211 | 0 | 0 | 0 |

Audit: `python -X utf8 tests/audit_regression_shards.py --reports docs/qa_runs_012770_browser_utf8_20261103 --category browser --expected-shards 4` reports 211 discovered, executed and passed scripts.

The initial system-codepage attempt in `qa_runs_012770_browser_20261103/` was discarded after Windows CP1252 failed to decode a generated Unicode fixture. The accepted UTF-8 run above has zero failures, timeouts or errors. Hosted origin/restart and physical-device cases are outside the script count. Exact-head CI, hosted deployment, real-network and owner visual acceptance remain separate.

Detailed reports: [shard 1](browser_shard_1_of_4.md), [shard 2](browser_shard_2_of_4.md), [shard 3](browser_shard_3_of_4.md), [shard 4](browser_shard_4_of_4.md).
