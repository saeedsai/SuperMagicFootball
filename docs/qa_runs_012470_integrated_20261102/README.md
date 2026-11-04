# 0.12.47.0 local integration evidence

**Date:** 2 November 2026  
**Candidate:** `0.12.47.0`  
**Base:** local worktree on `dev`, based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`; changes are uncommitted and were not promoted or deployed.

## Candidate work

- The portrait-orientation recommendation is now a named modal dialog, with keyboard focus containment and safe restoration on dismissal or automatic landscape hide. Existing game state, portrait threshold, four-button controls and page-session dismissal behavior remain.
- The LAN signaling broker now bounds live and in-progress WebSocket connections at 256 by default, configurable up to 4,096, while retaining the eight-per-IP limit. Reservations cover concurrent handshakes and are released on disconnect or failed upgrade.

## Validation

- `npm run test:node`: **1,590/1,590** passed; the 32-club, 384-player-slot runtime/data parity check passed.
- Focused orientation Node tests: **3/3**. Focused LAN budget/server/policy tests: **17/17**, including a real local server run that rejects the third socket at a configured limit of two and admits a replacement after a disconnect.
- Independent Node census: **407/407** across four shards; independent audit passed in [`node_independent/audit.json`](../qa_runs_012470_node_independent_20261102/audit.json).
- Portable Chromium census: **162/162** across four shards with zero failures, timeouts, errors, or unrun scripts; independent audit passed in [`browser/audit.json`](../qa_runs_012470_browser_20261102/audit.json).
- Data validation: **223 teams, 2,676 players, 84 avatar presets**, zero errors; see [`data-validator.json`](data-validator.json).
- The browser census includes eight persistent-profile Career/Cup same-origin app-server restart scenarios.
- `git diff --check` passes apart from existing Git LF-to-CRLF working-copy notices.

## Remaining acceptance

This is local source-tree validation. Exact-commit CI, protected promotion, Pages/hosted-byte checks, actual Windows screen-reader/physical-device checks, real two-device packet loss/reconnect, hosted broker/NAT load, and human visual approval remain open. No deployment or server readiness is claimed.
