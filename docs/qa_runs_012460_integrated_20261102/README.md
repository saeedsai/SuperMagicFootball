# 0.12.46.0 local integration evidence

**Date:** 2 November 2026  
**Candidate:** `0.12.46.0`  
**Base:** local worktree on `dev`, based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`; changes are uncommitted and were not promoted or deployed.

## Candidate change

LAN guest input now preserves a one-step action edge when its send is refused, throws, or has an ambiguous receipt. It keeps at most one bounded set of four known action edges, rebases a retry to the current valid host lead frame, and samples held controls/analog axes fresh. The pending edge expires after 250 ms or three total failed attempts and clears on successful send, stale/frozen host state, or transport reset. LAN guest DataChannel queue accounting remains capped at 16 KiB (LAN-091); the action retry contract is LAN-092. Offline play, save formats, four actions, and host-authoritative simulation are unchanged.

## Validation

- `npm run test:node`: **1,582/1,582** passed; 32 clubs, 384 player slots, and roster runtime/data parity passed.
- Focused LAN live-match and protocol suites: **76/76** passed. Release/version and release-gate contracts: **24/24** passed.
- Independent Node regression census: **404/404** across four shards; independent audit passed in [`node_independent/audit.json`](../qa_runs_012460_node_independent_20261102/audit.json).
- Portable Chromium regression census: **161/161** across four shards, with zero failures, timeouts, errors, or unrun scripts; independent audit passed in [`browser/audit.json`](../qa_runs_012460_browser_20261102/audit.json).
- Data validation: **223 teams, 2,676 players, 84 avatar presets**, zero errors; see [`data-validator.json`](data-validator.json).
- The browser census includes eight persistent-profile Career/Cup same-origin app-server restart scenarios; all passed.
- `git diff --check` passes apart from existing Git LF-to-CRLF working-copy notices.
- A separate forced-colors live-match acceptance pass (added after the full census) verifies menu focus, both HUD controls, all four touch actions, and the active-action border; see [the UX-102 acceptance report](../UX102_FORCED_COLORS_LIVE_MATCH_20261102.md).

Raw shard results are in [`npm-test-node.log`](../qa_runs_012460_node_20261102/npm-test-node-final.log), [`node_independent/`](../qa_runs_012460_node_independent_20261102/), and [`browser/`](../qa_runs_012460_browser_20261102/).

## Remaining acceptance

This is local source-tree validation. Exact-commit CI, protected promotion, Pages/hosted-byte checks, real two-device packet loss/reconnect, hosted broker/NAT behavior, physical Android/iOS/controller acceptance, and human visual approval remain open. No server readiness or deployment is claimed.
