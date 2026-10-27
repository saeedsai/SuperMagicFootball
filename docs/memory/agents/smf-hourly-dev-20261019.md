# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Ship bounded tested changes directly on dev; only protected exact-green promotion. Never create extra branches, force-push or bypass CI. Preserve 223 teams/2676 players, six formations, four buttons, Career/Cup ten slots, SD09, offline and saves.

## Current checkpoint
- 0.11.3.10 candidate: host LAN/P2P peer readiness failures and onReady exceptions release broken peers and clear approval without unregistering the room. Two focused regressions.
- Baseline dev/main b6155cf453a22d4fb6e409e0fc0d7b84e0c12475 identical at start; prior 0.11.3.9 CI status was not confirmed through connector status API. Physical LAN/P2P/TURN acceptance remains pending.
- Candidate exact-head Modular, 4 Node + 4 Chromium, protected promotion, Pages and hosted bytes are independent gates.

## Next smallest action
1. Inspect exact-head Modular and 4 Node + 4 Chromium results; fix failures.
2. Promote only fully green unchanged dev through protected workflow.
3. Verify main Pages deployment and hosted HTML/JS/CSS bytes.
4. Test two-device LAN and internet P2P/TURN.
5. Continue Player Studio, counterable Tricks and Crown Royals directional art.

## Ownership and exclusions
Only dev/main; no other agents' memory read or edited.

## Evidence
`src/modules/lan-auto-lobby.js`, `tests/lan_auto_lobby_flow.test.cjs`; release certification pending.

## Cleanup
Checkpoint below 4 KiB; no new branches or unrelated changes.
