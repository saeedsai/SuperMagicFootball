# 0.12.32.0 independent Node census — provisional

Run window: 1 November 2026, runner-reported shard start **23:27:12** through final shard completion at approximately **23:29:50** (local host clock).

All four shards completed with zero reported failures, timeouts, errors or unrun scripts:

| Shard | Executed | Failed | Timed out | Unrun | Discovered at shard start |
|---|---:|---:|---:|---:|---:|
| 1/4 | 99 | 0 | 0 | 0 | 394 |
| 2/4 | 99 | 0 | 0 | 0 | 395 |
| 3/4 | 99 | 0 | 0 | 0 | 395 |
| 4/4 | 98 | 0 | 0 | 0 | 395 |

**Do not use this as an exact-tree census.** Concurrent LAN source integration occurred while shards were running, and the discovered-script count changed from 394 to 395. These results are retained as provisional evidence only. Re-run all four shards after source integration is complete and aggregate only reports produced from one stable tree.
