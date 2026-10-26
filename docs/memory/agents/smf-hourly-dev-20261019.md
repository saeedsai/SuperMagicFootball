# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26

## Mission
Develop on dev only; promote only an exact fully green SHA through protected main. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- Candidate 0.11.3.1: LAN/Online P2P browser signaling now bounds outbound JSON/UTF-8 frames and closes a stalled WebSocket when its queued bytes would exceed 512 KiB, triggering existing reconnect. No protocol, roster, save or physics change.
- Previous P2P-005 0.11.3.0: internet Host/Find with separate room scopes, host consent, WebRTC and manual fallback. Render rollout and physical cross-network play unverified.
- Baseline dev f6529de5f23561d373be366c9174a0496fc5c42d had Modular QA #40391144323 green and Full #40391144329 in progress (4 Node, 3 Chromium green). Main was a9a6286c26dd4cb51b9907462001a7cf9d18ea99. This does not certify 0.11.3.1.

## Next smallest action
1. Verify exact new dev SHA Modular and full 4 Node + 4 Chromium; repair failures.
2. Promote only fully green exact dev head; verify main/Pages hosted bytes.
3. Confirm Render signaling deployment and scope separation; test two real phones/networks.
4. Add optional TURN configuration with safe defaults when relay exists.
5. Continue counterable Tricks, Player Studio and Crown Royals art QA.

## Ownership and exclusions
No extra branches, force pushes, bypassed security or weakened tests. Edit only this developer checkpoint.

## Evidence
- Focused Unicode, malformed frame, queue boundary and reconnect regression tests added. Exact-head CI and physical acceptance remain to be observed.

## Cleanup
Keep only dev/main and the sole registered checkpoint; preserve IDs, four controls, offline and saves.
