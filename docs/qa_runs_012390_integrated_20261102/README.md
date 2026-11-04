# Candidate 0.12.39.0 integrated local QA — 2 November 2026

This report covers the local `dev` working tree based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` plus the current uncommitted integration. Results are local only; nothing was committed, promoted, or deployed.

## Results

- `PYTHONUTF8=1 npm run test:node`: **1,573/1,573 passed**; generated roster census remains **32 clubs / 384 player slots**.
- Independent Node regression: **403/403 scripts passed** across four shards. Reports: [`qa_runs_012390_node_20261102`](../qa_runs_012390_node_20261102/).
- Portable Chromium browser census: **160/160 scripts passed**, zero failures, timeouts, runner errors, or unrun scripts across four shards. Reports: [`qa_runs_012390_browser_final_20261102`](../qa_runs_012390_browser_final_20261102/).
- Data validator: **223 teams, 2,676 players, and 84 avatar presets passed**.
- Concept manifest validator: **8 layers passed**; modular source validator passed all eight transparent editable layers.
- VIZ-05 focused gamepad navigation tests pass **2/2**. Desktop and simulated-touch browser coverage verifies Studio selector focus and Back routing; desktop also covers unsaved cancel, save, and persistence after reload. Physical controller acceptance remains open.
- VIZ-02 responsive route audit passes **18 menu routes × 3 viewport sizes** (54 samples), with no horizontal overflow, unlabeled visible controls, or page errors; visual, assistive-technology, and physical-device acceptance remain open ([evidence](../VIZ02_ROUTE_RESPONSIVE_CENSUS_20261102.md)).
- VIZ-01 touch-emulation geometry passes at **320×568, 390×844, 844×390, and 568×320** with no joystick/action-pad overlap; physical touch accuracy remains open ([evidence](../VIZ01_TOUCH_SEPARATION_20261102.md)).
- LAN30 local two-context Chromium/WebRTC acceptance verifies guest input ownership and replicated state, then injects a short synthetic ICE disconnect/recovery event and confirms fresh guest input after recovery. A subsequent focused rerun additionally shut down the local signaling broker after match setup; direct peer input and state replication continued. The real DataChannels remain connected during the synthetic ICE transition; neither check certifies packet loss. Physical two-client, hosted broker, restrictive NAT, and device gates remain open.
- UX27 general save-import failure acceptance passes on desktop and simulated touch. The export/import roundtrip also passes on both; malformed-file dialog checks now wait for the dialog event rather than a fixed 150 ms delay.
- `git diff --check`: passed; Git reports existing line-ending normalization notices.

The 30 completed official EA source-audit batches cover 1,260 of 2,160 direct same-name field observations; 900 mappings remain unresolved. Wolves has no matching ledger membership rows. Flamengo has 12 rows without stable FC 27 source IDs/check dates or an official team entry. The source-ledger SHA-256 remains `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`. No roster values or tiers changed.

No new concept artwork or Studio assets changed. The approved visual-source, owner review, and physical-device gates remain separate and open. Exact-head CI, protected promotion, hosted Pages verification, and real two-device LAN acceptance are also still outstanding.
