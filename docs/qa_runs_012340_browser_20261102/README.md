# Portable Chromium census — 0.12.34.0

Run sequentially on 2 November 2026 against the 0.12.34.0 local working tree, based on `dev` commit `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` with uncommitted changes. All four shards discovered the same 150 browser scripts. Playwright Chromium ran locally with portable-browser compatibility; individual test scripts include desktop and simulated-touch profiles where applicable.

| Shard | Requested | PASS | FAIL | TIMEOUT | ERROR | NOT_RUN |
|---|---:|---:|---:|---:|---:|---:|
| 1/4 | 38 | 38 | 0 | 0 | 0 | 0 |
| 2/4 | 38 | 38 | 0 | 0 | 0 | 0 |
| 3/4 | 37 | 37 | 0 | 0 | 0 | 0 |
| 4/4 | 37 | 37 | 0 | 0 | 0 | 0 |
| **Total** | **150** | **150** | **0** | **0** | **0** | **0** |

Raw JSON/Markdown shard reports are retained beside this summary. Earlier timeouts on Career backup and Studio tests were diagnosed as invalid legacy fixtures or transient browser startup; the corrected backups and isolated Studio rerun pass here. The tree was not committed or pushed; this is local browser evidence, not physical-device, CI or hosted acceptance.
