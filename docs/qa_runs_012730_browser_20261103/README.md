# Candidate 0.12.73 portable Chromium census

Date: 3 November 2026. Four shards executed against the local `.73` fixture with Python UTF-8 mode and portable Chromium.

| Shard | Pass | Fail | Timeout | Error |
|---|---:|---:|---:|---:|
| 1/4 | 52 | 0 | 0 | 0 |
| 2/4 | 52 | 0 | 0 | 0 |
| 3/4 | 51 | 0 | 0 | 0 |
| 4/4 | 50 | 0 | 1 | 0 |
| Total | 205 | 0 | 1 | 0 |

The only timeout was `graphics_integration_v082522.py` at the shard runner's 55-second limit under parallel load. Reran that script alone through `tests/browser_runner_compat.py`; it passed **19/19** desktop and simulated-touch checks, with no failures. The census therefore had 205/206 shard executions pass and one isolated retry pass. Do not describe this as 206/206 shard execution.

Detailed reports: [shard 1](browser_shard_1_of_4.md), [shard 2](browser_shard_2_of_4.md), [shard 3](browser_shard_3_of_4.md), [shard 4](browser_shard_4_of_4.md). This local evidence does not replace exact-head CI, hosted deployment, physical-device, real-network, or owner visual acceptance.
