# Candidate 0.12.75 portable Chromium census

Date: 3 November 2026. Four browser shards ran against the local `.75` fixture with Python UTF-8 mode and portable Chromium. The regression-shard audit passed.

| Shard | Pass | Fail | Timeout | Error |
|---|---:|---:|---:|---:|
| 1/4 | 53 | 0 | 0 | 0 |
| 2/4 | 53 | 0 | 0 | 0 |
| 3/4 | 53 | 0 | 0 | 0 |
| 4/4 | 52 | 0 | 0 | 0 |
| Total | 211 | 0 | 0 | 0 |

Three older fixtures now seed already-owned appearance items after `.75` made those cosmetics purchase-backed; the tests still exercise selection, preview and persistence without bypassing Store or tier enforcement. All corrected scripts passed in this census. One script reports three external acceptance cases as **NOT EXECUTED** (hosted origin, process restart, and physical device); those are not counted among the 211 script executions.

Detailed reports: [shard 1](browser_shard_1_of_4.md), [shard 2](browser_shard_2_of_4.md), [shard 3](browser_shard_3_of_4.md), [shard 4](browser_shard_4_of_4.md). Exact-head CI, hosted deployment, physical-device, real-network, and owner visual acceptance remain separate.
