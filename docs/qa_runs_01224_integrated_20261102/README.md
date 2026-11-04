# SuperMagicFootball local integrated QA

**Date:** 2 November 2026  
**Package candidate:** 0.12.24.0  
**Source:** current local uncommitted integration on `dev` parent `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`

| Gate | Result |
|---|---:|
| `npm run test:node` (build + complete CJS suite + club parity) | **PASS — 1,479/1,479** |
| Independent Node regression census | **PASS — 375/375** (four shards; reports in `../qa_runs_01224_node_20261102_recheck/`) |
| Chromium regression census | **PASS — 134/134** (four shards; reports in `../qa_runs_01224_browser_20261102_recheck/`) |
| Data validation | **PASS — 223 teams, 2,676 players, 84 avatar presets** |
| SuperMagicAssetStudio official project checks | **PASS** — G1 refreshed front candidate and G2 normalized/quarter trial projects valid with no warnings |

New Career transfer atomicity, Cup active-slot restore, manifest validation and optional Hinomaru ball cosmetic tests are included in the 1,479 case suite. The ball cosmetic is opt-in; a paired-engine regression confirms it does not change simulation state. The G2 and Run11 projects are art-fit hypotheses, not art approval.

On Windows, use `PYTHONUTF8=1` for the Python build/runner. Reproduction:

```powershell
$env:PYTHONUTF8='1'
npm run test:node
python -X utf8 scripts/validate_data.py
```

These checks validate the local source tree; exact-commit CI, protected promotion, hosted deployment, physical-device/two-device acceptance, and human art approval remain separate.
