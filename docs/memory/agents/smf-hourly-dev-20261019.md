# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Bounded dev-only increments; promote only exact green head via protected pipeline. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves. Only dev/main, no force-push or security bypass.

## Current checkpoint
- Candidate 0.11.3.8: host SDP offer creation now has a 25-second timeout; guest-left/reconnect cancel timer; stale completion/rejection cannot dispose replacement peer. Two Node regressions.
- Baseline dev/main `4b15b9c4e3c7e3da98bf7d533be534c36d3a1a62` identical. Modular #40435820821 and Full 4 Node + 4 Chromium #40435820727 green; protected promotion succeeded. Hosted Pages byte smoke not rechecked in this run.
- New candidate exact-head CI, promotion, hosted Pages and physical two-device LAN/P2P/TURN acceptance pending.

## Next smallest action
1. Inspect exact-head Modular and four Node/four Chromium; repair failures.
2. Promote only exact green dev head through protected pipeline.
3. Verify main Pages and hosted HTML/JS/CSS byte hashes.
4. Test two-device LAN and cross-network P2P, including TURN.
5. Continue Player Studio, counterable Tricks and Crown Royals art.

## Ownership and exclusions
Sole developer on dev; only dev/main. Do not read or edit other agents' memory.

## Evidence
Source and regressions: `src/modules/lan-auto-lobby.js`, `tests/lan_auto_lobby_flow.test.cjs`. Prior run IDs above; new exact-head QA pending.

## Cleanup
Checkpoint under 4 KiB; no unrelated branches or memory changed.
