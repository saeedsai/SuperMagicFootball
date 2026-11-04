# SuperMagicFootball 0.12.24.0 local integration QA

Executed 1 November 2026 on the current uncommitted integration based on `dev` parent `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`.

| Gate | Result | Evidence |
|---|---:|---|
| Modular build + full CJS Node suite | **PASS 1,453/1,453** | `npm run test:node` with `PYTHONUTF8=1` |
| Club 2026/27 FC27 parity | **PASS** | Included in `npm run test:node`; 32 clubs, 384 player slots |
| Independent Node regression census | **PASS 370/370** | Four `node_shard_*_of_4.json` reports in this folder |
| Chromium browser regression census | **PASS 132/132** | Four `browser_shard_*_of_4.json` reports in `../qa_runs_01224_browser_utf8/` |
| Data validation | **PASS** | `scripts/validate_data.py`; 223 teams and 2,676 players, zero errors |

The Windows run requires `PYTHONUTF8=1` for reliable subprocess output decoding. The first browser attempt omitted it and failed during output decoding; the UTF-8 rerun passed all four shards. These results validate the local source tree, not a commit, hosted deployment, physical devices, two-device LAN hardware, or human art approval.
