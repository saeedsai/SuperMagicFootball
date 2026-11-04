# Candidate 0.12.79 portable Chromium census

Date: 3 November 2026. Four serial portable-Chromium shards ran on the rebuilt `.79` modular fixture with UTF-8 mode. The regression-shard manifest audit passed.

| Shard | Pass | Fail | Timeout | Error |
|---|---:|---:|---:|---:|
| 1/4 | 54 | 0 | 0 | 0 |
| 2/4 | 53 | 0 | 0 | 0 |
| 3/4 | 53 | 0 | 0 | 0 |
| 4/4 | 53 | 0 | 0 | 0 |
| Total | **213** | **0** | **0** | **0** |

The census includes `player_studio_320_touch_browser_qa.py`, which checks all 17 selectors at 320×568 for unique accessible names, at least 44px height, fieldset containment, no horizontal overflow and no page errors. Keeper glove motion has separate actual-renderer desktop/touch evidence in [the VIZ-06 report](../KEEPER_DIVE_GLOVE_REACH_20261103.md).

Physical-device/controller, hosted-origin, real-network/two-device and owner visual acceptance remain separate.

Detailed reports: [shard 1](browser_shard_1_of_4.md) · [shard 2](browser_shard_2_of_4.md) · [shard 3](browser_shard_3_of_4.md) · [shard 4](browser_shard_4_of_4.md) · [manifest audit](audit.json).
