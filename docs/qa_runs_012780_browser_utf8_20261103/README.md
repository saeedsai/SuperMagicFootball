# Candidate 0.12.78 portable Chromium census

Date: 3 November 2026. Four portable-Chromium shards ran on the `.78` local fixture with `PYTHONUTF8=1`; the regression-shard audit passed.

| Shard | Pass | Fail | Timeout | Error |
|---|---:|---:|---:|---:|
| 1/4 | 53 | 0 | 0 | 0 |
| 2/4 | 53 | 0 | 0 | 0 |
| 3/4 | 53 | 0 | 0 | 0 |
| 4/4 | 53 | 0 | 0 | 0 |
| Total | 212 | 0 | 0 | 0 |

Audit discovered, executed and passed 212 scripts across four shards. The census includes the new `ux102_pinch_zoom_browser_qa.py` test. Its check verifies computed ancestor touch permissions on 320×568 portrait and 844×390 landscape, while the joystick, four action buttons and Studio drag canvas retain `touch-action:none`.

Physical-device pinch, hosted origin/restart and physical multiplayer are outside the browser-script count. Exact-head CI, hosted deployment, real-network and owner visual acceptance remain separate.

Detailed reports: [shard 1](browser_shard_1_of_4.md), [shard 2](browser_shard_2_of_4.md), [shard 3](browser_shard_3_of_4.md), [shard 4](browser_shard_4_of_4.md).
