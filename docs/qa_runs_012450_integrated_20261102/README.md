# 0.12.45.0 local integration evidence

**Date:** 2 November 2026  
**Candidate:** `0.12.45.0`  
**Base:** local worktree on `dev`, based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`; changes are uncommitted and were not promoted or deployed.

## Candidate change

LAN guest RTCDataChannel sends now enforce a 16 KiB bound over existing buffered bytes plus the encoded input. Over-budget, unsafe, fractional, negative or nonfinite queue counters fail closed before `send()`. A rejected send leaves the input's frame and sequence available for retry after the channel drains. Legacy channel doubles that omit `bufferedAmount` remain supported as empty queues.

## Validation

- `npm run test:node`: **1,579/1,579** passed, including the LAN boundary, overflow, invalid-counter, drain/retry and sequence/frame-preservation checks.
- Independent Node regression census: **404/404** across four shards; non-overlap audit passed in [`node_independent/audit.json`](../qa_runs_012450_node_independent_20261102/audit.json).
- Portable Chromium regression census: **161/161** across four shards, with zero failures, timeouts, errors or unrun scripts; non-overlap audit passed in [`browser/audit.json`](../qa_runs_012450_browser_20261102/audit.json).
- Data validation: **223 teams, 2,676 players, 84 avatar presets**, zero errors; see [`data-validator.json`](data-validator.json).
- SAVE-103 persistent-profile same-origin app-server restart coverage is included in the browser census. Its eight desktop/simulated-touch occupied/empty Career/Cup scenarios passed, including exact vault and legacy-mirror byte checks.
- Focused LAN protocol/channel/recovery suites passed **43/43**. `git diff --check` passes apart from the existing Git LF-to-CRLF working-copy notices.

## Remaining acceptance

This is local source-tree validation. Exact-commit CI, protected promotion, Pages/hosted-byte checks, real two-device packet loss/reconnect, hosted broker/NAT behavior, physical Android/iOS/controller acceptance and human visual approval remain open. No server readiness or deployment is claimed.
