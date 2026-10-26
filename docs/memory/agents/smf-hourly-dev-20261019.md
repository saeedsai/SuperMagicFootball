# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26 13:28 CET

## Mission
One bounded tested increment per run on existing dev; only dev/main, no force push or bypass. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline/saves.

## Current checkpoint
- Baseline dev/main `5a0b8b2a24319f40d272128b82e4394e5701715f` (0.10.7.6). Dev Modular #40320152892, Full 4+4 #40320152920 and Pages #40322281677 green. Main Full #40322281733 browser shard 3 failed hosted LAN room registration timeout (24/25 browser tests passed).
- LAN-064 0.10.7.7 candidate: resend idempotent Host Game registration every 10s until ack; cancel on broker error, disconnection, reset or success. Controlled mock-timer Node regression added.

## Next smallest action
1. Inspect exact-head Modular and Full four Node/four Chromium CI, repair failures.
2. Promote exact green dev through protected pipeline; verify main and hosted Pages hashes.
3. Diagnose Render signaling cold starts and physical two-phone matchmaking.
4. Continue LAN visual interpolation and Crown Royals art improvements.
5. Preserve checkpoints, continue next bounded dev increment while release gates are pending.

## Ownership and exclusions
Only this checkpoint writable; no other agent memories, bypasses or force pushes.

## Evidence
- LAN-064 regression in tests/lan_auto_lobby_flow.test.cjs; server duplicate host registration idempotency.
- CI and real devices remain authoritative for release and visual acceptance.

## Cleanup
- Checkpoint below 4 KiB. No other agents' files altered.
