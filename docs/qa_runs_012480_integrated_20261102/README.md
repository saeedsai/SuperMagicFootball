# 0.12.48.0 local integration evidence

**Date:** 2 November 2026  
**Candidate:** `0.12.48.0`  
**Base:** local worktree on `dev`, based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`; all changes are uncommitted and have not been promoted or deployed.

## Candidate work

- Career match advancement now rejects malformed scores and invalid shootout-winner values before changing tables, money, player progress, or history. Validation is shared by the game and modular APIs.
- The SD13 read-only verified-player legacy audit detects malformed, fractional, below-range, and above-range field-special levels without rewriting saved equipment.
- Hosted Internet P2P signaling now limits full inbound relay-wire data to 512 KiB per peer per one-second relay window, alongside the 90-frame/s and per-message limits. It closes only an over-budget sender; local WebSocket coverage confirms its healthy receiver remains connected.
- Candidate `.47` portrait-dialog accessibility and global LAN connection budgeting remain included.
- Feyenoord, Como, and PSV Eindhoven official roster source audits add documented field observations only. No canonical roster, stat, tier, or source-ledger values were changed; the shared ledger hash is unchanged.

## Validation

- `npm run test:node`: **1,594/1,594**; the 32-club / 384-slot runtime-data parity check passed.
- Independent Node census: **409/409** across four shards; audit: [`node_independent/audit.json`](../qa_runs_012480_node_independent_20261102/audit.json).
- Data validation: **223 teams, 2,676 players, 84 avatar presets**, zero errors; see [`data-validator.json`](data-validator.json).
- Focused Career validation: **16/16**; LAN relay/budget acceptance: **47/47**; orientation dialog: **3/3**; SD13/tier policy and full-roster non-mutation checks passed.
- VIZ-01 touch separation passed at 320×568, 390×844, 844×390, and 568×320. Physical-device reach/safe-area review remains separate.
- Portable Chromium census: **162/162** across four shards, zero failures, timeouts, errors, or unrun scripts; audit: [`browser/audit.json`](../qa_runs_012480_browser_20261102/audit.json). The initial concurrent run timed out once on the graphics-integration script; an isolated retry passed **19/19**, and the entire affected 41-test shard then passed in isolation.
- Read-only source coverage now includes 58 teams and **2,425/4,176** trusted direct same-name field observations, with **1,751** unresolved or source-conflicted slots; no source ledger or roster values were changed.
- `git diff --check` reports no whitespace errors; Git emits only existing LF-to-CRLF working-copy notices.

## Remaining acceptance

This is local source-tree validation. Exact-commit CI, protected promotion, Pages/hosted-byte verification, real Android/iOS/gamepad review, real two-device packet-loss/reconnect tests, hosted broker/NAT/load checks, and human visual approval remain separate. No deployment or hosted-server readiness is claimed.
