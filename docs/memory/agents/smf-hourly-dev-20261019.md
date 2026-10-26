# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26 16:03 CET

## Mission
One bounded tested increment each hourly run on existing dev. Protected green exact-head main promotion only. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- Baseline main=dev f69e79b230af2e4a35b535a40887b76d1f23a248, 0.10.7.12; equality alone does not certify Pages bytes or physical LAN.
- LAN-070 candidate 0.10.7.13: guest rejects snapshots while disconnected; on observed disconnection resets latestTick, lastSent and snapshot freshness. A host restarted at tick zero is accepted after reconnect. Source-executed red-before/green-after V8 check passed; Node regression added, full CI pending.
- LAN-069 host resets guest held-button edges on disconnect. LAN-068 retries explicitly refused guest sends. Neither certifies physical two-client acceptance.

## Next smallest action
1. Inspect exact dev-head Modular QA and full 4 Node/4 Chromium; repair any failure.
2. Promote only exact green head through protected workflow; verify main and Pages bytes.
3. Verify LAN Host/Find, admission, restart and play on two phones.
4. Implement next counterable four-button Player Studio Trick increment.
5. Continue Crown Royals front/quarter/side/back graphics QA.

## Ownership and exclusions
Only own checkpoint writable; never create branches, force push, bypass security or modify other agents' memory. Keep under 4 KiB; Git history is audit.
