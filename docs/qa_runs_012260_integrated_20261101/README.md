# SuperMagicFootball integrated local QA — 0.12.26.0

**Date:** 1 November 2026  
**Source:** local uncommitted integration on `dev`, based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`

| Gate | Result |
|---|---:|
| `npm run test:node` (build, full CJS suite, club parity) | **PASS — 1,504/1,504** |
| Independent Node regression census | **PASS — 381/381** (four shards in `../qa_runs_012260_node_20261101_final/`) |
| Chromium regression census | **PASS — 136/136** (four shards in `../qa_runs_012260_browser_20261102/`; final About and transfer UI retests also pass after release-date update) |
| Data validation | **PASS — 223 teams, 2,676 players, 84 avatar presets** |
| Concept source manifest | **PASS — 8/8 layers** (covered by the full Node suite) |
| Transfer quote browser acceptance | **PASS — desktop and simulated touch**; live selection updates and affordability announcement verified |
| SuperMagicAssetStudio unit/contract/browser | **PASS — 222/222, 146/146, 70/70** (Studio source unchanged; see `../../../SuperMagicAssetStudio/docs/TEST_REPORT_CURRENT.md`) |

UX28-TRANSFER-QUOTE-01 adds one pure quote helper used by standalone and bundled Career APIs. It keeps the existing purchase price and sale-value fallbacks, floors the 35% outgoing credit, shows projected balance, and preserves the existing rule that the full incoming fee must be available before sale proceeds apply. The accessible status updates for both player selectors and does not write to the Career save. Focused quote and atomicity coverage passes 10/10.

This is local source-tree evidence, not a release or deployment claim. Exact-commit CI, protected promotion, hosted Pages bytes, physical devices, two-device LAN, and human art approval remain separate gates. G1/G2 and Run12 art projects remain technically checked but unapproved for production.
