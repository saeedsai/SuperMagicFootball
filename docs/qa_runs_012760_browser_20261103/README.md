# Candidate 0.12.76 portable Chromium census

Date: 3 November 2026. Four browser shards ran against the local `.76` fixture with Python UTF-8 mode and portable Chromium. The regression-shard audit passed.

| Shard | Pass | Fail | Timeout | Error |
|---|---:|---:|---:|---:|
| 1/4 | 53 | 0 | 0 | 0 |
| 2/4 | 53 | 0 | 0 | 0 |
| 3/4 | 53 | 0 | 0 | 0 |
| 4/4 | 52 | 0 | 0 | 0 |
| Total | 211 | 0 | 0 | 0 |

The census includes hosted/local LAN browser coverage, Player Studio, gameplay, UI and offline flows. One browser script reports three external acceptance cases as **NOT EXECUTED** (hosted origin, process restart and physical device); these are outside its 211 script-execution count.

Detailed reports: [shard 1](browser_shard_1_of_4.md), [shard 2](browser_shard_2_of_4.md), [shard 3](browser_shard_3_of_4.md), [shard 4](browser_shard_4_of_4.md). Exact-head CI, deployment, physical-device, real-network and owner visual acceptance remain separate.
