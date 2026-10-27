# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Develop directly on dev, promote only exact green head through protected main. Preserve 223 teams/2676 players, six formations, exactly four buttons, ten Career/Cup slots, SD09, offline and save compatibility. Only dev/main branches; never force-push or bypass CI/security.

## Current checkpoint
- Candidate 0.11.3.5: signaling connection watchdog (12s) retries a WebSocket that never opens/closes; stale timers cannot retire live sockets; cancels on open, close, exit. Three focused Node regressions.
- Prior 0.11.3.4 exact SHA `1a05837ec57cd9d6524d766c833091d3ec37b261`: dev Modular #40416902598 and Full 4+4 #40416902606 green; main Full hosted smoke #40418467148 and Pages #40418466165 green. This does not certify 0.11.3.5.
- Render signaling broker deployment reported earlier; physical two-phone LAN and cross-network P2P remain uncertified; TURN-dependent networks may fail.

## Next smallest action
1. Check 0.11.3.5 exact-head Modular QA and four Node + four Chromium shards; fix failures.
2. Promote only exact green dev to main through protected pipeline.
3. Verify main, Pages deployment and hosted byte smoke.
4. Validate two real devices on LAN/P2P and Render room scope.
5. Continue Player Studio, counterable Tricks and Crown Royals directional graphics.

## Cleanup
Keep this checkpoint under 4 KiB. Only dev/main branches; no other agents' memory edited.
