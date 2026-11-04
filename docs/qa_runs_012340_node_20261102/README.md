# Independent Node census — 0.12.34.0

Run on 2 November 2026 against the 0.12.34.0 local working tree, based on `dev` commit `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` with uncommitted changes. All four shards discovered the same 397-script census.

| Shard | Requested | PASS | FAIL | TIMEOUT | ERROR | NOT_RUN |
|---|---:|---:|---:|---:|---:|---:|
| 1/4 | 100 | 100 | 0 | 0 | 0 | 0 |
| 2/4 | 99 | 99 | 0 | 0 | 0 | 0 |
| 3/4 | 99 | 99 | 0 | 0 | 0 | 0 |
| 4/4 | 99 | 99 | 0 | 0 | 0 | 0 |
| **Total** | **397** | **397** | **0** | **0** | **0** | **0** |

Raw JSON/Markdown shard reports are retained beside this summary. The tree was not committed or pushed; this is local test evidence, not GitHub CI or deployment evidence.
