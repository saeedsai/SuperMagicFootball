# Candidate 0.12.74 portable Chromium census

Date: 3 November 2026. Four shards ran against the local `.74` fixture with Python UTF-8 mode and portable Chromium.

| Shard | Pass | Fail | Timeout | Error |
|---|---:|---:|---:|---:|
| 1/4 | 50 | 1 | 1 | 0 |
| 2/4 | 52 | 0 | 0 | 0 |
| 3/4 | 52 | 0 | 0 | 0 |
| 4/4 | 51 | 0 | 0 | 0 |
| Total | 205 | 1 | 1 | 0 |

The timeout was `graphics_integration_v082522.py` at the shard runner's 55-second limit under parallel load. Its isolated retry passed **19/19** desktop and simulated-touch checks. `ux27_general_save_roundtrip_browser_qa.py` passed its desktop leg but Playwright reported `Download.path: canceled` during the simulated-touch leg under shard load; isolated retry passed on desktop and simulated touch. These retries resolve the individual script checks but do not change the four-shard summary or make it a 207/207 shard pass.

Detailed reports: [shard 1](browser_shard_1_of_4.md), [shard 2](browser_shard_2_of_4.md), [shard 3](browser_shard_3_of_4.md), [shard 4](browser_shard_4_of_4.md). Exact-head CI, hosted deployment, physical-device, real-network, and owner visual acceptance remain separate.
