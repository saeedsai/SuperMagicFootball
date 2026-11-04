# SuperMagicFootball local integrated QA

**Date:** 2 November 2026  
**Package candidate:** 0.12.24.1  
**Source:** current local uncommitted integration on `dev`, parent `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`

| Gate | Result |
|---|---:|
| `npm run test:node` (build + complete CJS suite + club parity) | **PASS — 1,479/1,479** |
| Independent Node regression census | **PASS — 375/375** (four shards; reports in `../qa_runs_012241_node_20261102/`) |
| Chromium regression census | **PASS — 134/134** (four shards; reports in `../qa_runs_012241_browser_20261102/`) |
| Data validation | **PASS — 223 teams, 2,676 players, 84 avatar presets** |
| Character manifest validation | **PASS — 8 layers, safe package paths, aligned per-view canvases** |
| SuperMagicAssetStudio unit/contract/browser | **PASS — 222/222, 146/146, 70/70** |

The browser census includes Cup empty-active-slot recovery, VIZ-01 menu overflow at desktop and narrow phone sizes, and modular art fallback recovery. Studio tests cover opt-in edge-spill radius controls while preserving legacy radius-1 behavior. G1/G2 and Run11 Studio projects review as valid with zero warnings; their art remains unapproved.

On Windows, use UTF-8 mode for the Python build and browser scripts:

```powershell
$env:PYTHONUTF8='1'
npm run test:node
python -X utf8 scripts/validate_data.py
python -X utf8 scripts/validate_concept_manifest.py
```

These checks validate the local source tree; exact-commit CI, protected promotion, hosted deployment, physical-device/two-device acceptance, and human art approval remain separate.
