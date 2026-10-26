# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26

## Mission
Develop on existing dev only; promote exact fully green SHA through protected main pipeline, never force-push or bypass security. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline/saves.

## Current checkpoint
- Candidate 0.11.3.0 P2P-005: internet P2P auto Host/Find with explicit broker room scope, host consent, shared host-authoritative LAN gameplay, STUN, manual P2P fallback. LAN retains subnet-scoped discovery plus manual fallback. Top-level Online backend menu unchanged.
- Added tests/p2p_auto_discovery.test.cjs (two synthetic clients, host approval), tests/lan_two_client_browser_qa.py (two real Chromium LAN clients), and tests/p2p_hosted_discovery_browser_qa.py (hosted WebSocket scope across distinct synthetic public IPs). None is physical two-device acceptance until CI confirms.
- Existing hosted signal broker must deploy new scoped code for global P2P search. This is lightweight signaling, not gameplay hosting. No guaranteed traversal of restricted NAT without TURN. Two-phone/real internet acceptance and hosted Render rollout unverified.
- Prior dev a9a6286c26dd4cb51b9907462001a7cf9d18ea99 (0.11.2.1) had 4 Node + 3 Chromium green in Full #40384978348, last browser shard in progress, Concept Hero #40384978339 green. Main last confirmed da78ebbff2797978e2eb36e8f56b58fe2a82e4df (0.11.2.0).

## Next smallest action
1. Verify candidate exact-head Modular and full 4 Node + 4 Chromium; fix CI failures.
2. Promote only green exact dev head and verify Pages byte smoke.
3. Confirm Render signaling deployment, scope separation and origin policy; verify two actual networks/phones.
4. Implement and test TURN opt-in only when available; preserve safe defaults.
5. Continue counterable four-button Tricks, Player Studio and Crown Royals art QA.

## Ownership and exclusions
No extra branches, no weakened tests, no claims of physical-device certification without evidence. Sole developer checkpoint under 4 KiB.
