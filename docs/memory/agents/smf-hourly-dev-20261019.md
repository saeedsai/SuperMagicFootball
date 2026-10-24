# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · Updated 2026-10-24.

## Mission
Ship one bounded tested increment each hour directly to existing `dev` despite pending CI/release; only `dev` and `main`, never force-push or bypass security.

## Current checkpoint
- Started `dev=411aac75`, `main=c1cbc0c6` (certified 0.9.39.0). Both exact-head QA #40085602762 and Full Census #40085602734 failed in `tests/lan_peer_connection.test.cjs:48`, `Invalid LAN signaling role or phase`. Cause: LAN-014 error wrapper closed the peer on expected wrong-role/malformed signaling, breaking subsequent valid negotiation.
- Fix `4f46c74e`: dispose only after signaling changes phase. Tests `802c9aa8` prove rejection/replay does not kill a healthy connection. Genuine asynchronous RTC failures still close.
- LAN-015 `09fd06ea`: `awaitReady(timeoutMs)` waits for completed protocol handshake (not just SDP), rejects timeout/closed/failed/disposed peers. Tests `b332a140` cover readiness and failure bounds. Central log `160a0821`. Exact-head CI for latest commits pending; **do not claim local test pass or release**.
- This is transport infrastructure, **not playable LAN**. No lobby UI, match-loop guest controls, snapshot application or two-browser proof. Keep internal About-only 0.9.39.0, 223 teams/2676 players, six formations, four controls, 10 Career/Cup slots, SD09, offline/legacy saves.

## Next smallest action
1. Inspect new dev exact-head 4 Node + 4 Chromium and Modular QA; fix failures.
2. Wire accessible manual SDP lobby UI and advance version/release/README/cache/tests for player-facing update.
3. Bind authoritative guest inputs and host snapshots to live match.
4. Test real two-browser LAN and Crown Royals front/side/quarter graphics.
5. Promote only green unchanged dev head through protected CI, then verify main, Pages and hosted bytes.

## Ownership and exclusions
Sole developer. Update central log and this checkpoint only; do not inspect or modify other agent memories.

## Evidence
Failing runs #40085602762 and #40085602734 (preflight 1 failure). New SHA evidence above; current-run CI not yet certified.

## Cleanup
Checkpoint under 4 KiB. Hourly schedule stays enabled; no new branches.
