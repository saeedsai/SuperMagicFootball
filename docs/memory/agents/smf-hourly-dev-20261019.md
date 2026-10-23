# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · **Updated:** 2026-10-23

## Mission
Ship one small tested roadmap increment per run directly on existing `dev`, even while earlier commits await QA or release. Diagnose and repair blockers safely; never bypass GitHub/OpenAI security, protections or force-push. Only `dev` and `main` are permitted branches.

## Current checkpoint
- Start-of-run `dev=main=05525054256ca6bcb0f9e3bf30a70f848befab32`. Both certified: Full Regression #39923610369 (four Node/four Chromium + hosted smoke PASS), Modular QA #39922362823 PASS, Pages #39923611102 PASS.
- New LAN increment: `src/modules/lan-data-channel.js` commits `d6ea6f84`, `f3b91a12`; `tests/lan-data-channel.test.cjs` commit `27f547f5`. Binds host and guest to RTCDataChannel-style open/message/close events. Tests cover hello/input/leave, replay, peer identity latch, disconnect/replacement and failed sends.
- LAN still needs RTCPeerConnection SDP/ICE signaling, authenticated join confirmation, match-state replication and real two-browser smoke; no playable-LAN claim.
- Installed player-facing version is `0.9.17.1` in Settings → About only. Unbundled LAN module/tests do not change the player-facing bundle/version. Never conflate candidate dev with certified main.
- Historical memory-contract failure (wrong identity marker/headings) was repaired; preserve exact marker and six required headings. Blue/neon Player Studio and earnable coins remain backlog.

## Next smallest action
1. Certify exact `dev` with focused Node tests, full 4 Node + 4 Chromium Census and Modular QA; repair any confirmed failure.
2. Add bounded RTC peer-connection/signaling handshake for two-browser LAN with explicit trust boundaries.
3. Add Player Studio ability-row visuals and unique icons with coordinated four-field release bump, README and offline cache.
4. Implement pure idempotent coin wallet ledger with tests before UI, saves or unlocks.
5. Promote only exact green `dev` via protected pipeline, verify `main` SHA, Pages and hosted byte smoke.

## Ownership and exclusions
Sole developer `smf-hourly-dev-20261019`; edit only this agent checkpoint and central docs. Preserve 223 teams/2676 player IDs, 2GK/3DF/4MF/3FW, six formations, four actions, offline/save compatibility, Career/Cup ten slots and SD09. No extra branches or premature multiplayer/currency claims.

## Evidence
Prior certified baseline: #39923610369, #39922362823, #39923611102. Candidate CI for `27f547f5`: Full Regression #39928852428 and Modular QA #39928852470 were running when checked. Refresh exact head after docs writes.

## Cleanup
Keep checkpoint under 4096 UTF-8 bytes, six required headings and exact identity marker. Record actual failures; never weaken QA to obtain green.
