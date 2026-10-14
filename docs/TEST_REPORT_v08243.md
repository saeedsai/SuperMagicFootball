# QA report — Supermagic Football v0.8.24.3

## Completed actual checks
- Full inherited + new Node `npm test`: **61/61 scripts PASS** (source: execution log at build time; runner produces current test output).
- New `v08243_full_match_calibration.mjs`: **10 full-engine short AI/AI match fixtures PASS**, five selectable difficulties and two fixed seeds, bounded completion and finite state. Captured machine data in `KEEPER_FULL_MATCH_CALIBRATION_v08243.json`.
- Chromium `master_ui_contracts.py`: **PASS desktop and simulated Android**.
- Full browser shard 0: **6 PASS, 0 FAIL, 1 NOT_EXECUTED** (interrupted while running seventh script); the other five shards **not executed** this iteration. No claim of 38/38. See `qa_runs/master_full_browser_s0of6_08243.json`.
- QA master catalog: **402 documented cases**, not 402 executed tests.

## Observation and limitations
- All two-match difficulty groups showed zero goals and four saves. This short-match synthetic evidence is insufficient for real-match shot/goal distributions or to diagnose a goalkeeper physics defect. No speculative keeper tuning was made.
- Earlier browser suite had 38/38 passes on prior version v0.8.24.2; that result does not certify this build.
- No actual hardware or normal-origin persistent-storage certification.
