# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Continue bounded tested development on dev only; main promotion protected and exact-head green. Preserve 223 teams/2676 players, six formations, four action buttons, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- 0.11.4.0 dev candidate: LAN/P2P names for host and guest in lobby, consent and match toast; broker name forwarding; 35s WebRTC ready deadline and TURN-related failure diagnosis.
- User verified discovery+approval but P2P match did not establish. STUN-only internet ICE cannot traverse every NAT. Needs provisioned TURN credentials/infrastructure plus real two-device tests. Latest previously certified main 58cf9298bd59e3b02e6d5adab09c4ed17585e619; candidate base dev af7b80d392a1329f9174a40d3b3527552197060f.

## Next smallest action
1. Inspect newest exact-head 4 Node + 4 Chromium and Modular QA; repair failures.
2. Promote only completely green unchanged dev and verify Pages asset bytes.
3. Update hosted Render signaling broker to forward guest name and verify live commit.
4. Add secure ephemeral TURN relay configuration, validate two-phone/cross-network Host/Join/Play.
5. Continue Player Studio, counterable Tricks and Crown Royals art.

## Ownership and exclusions
Only dev/main and own memory; no foreign memory reads.

## Evidence
`src/modules/lan-auto-lobby.js`, `scripts/lan-server.mjs`, `src/modules/ui.js`, `tests/lan_auto_lobby_flow.test.cjs`, `tests/lan_room_snapshot.test.cjs`. No physical device/Render deployed claim.

## Cleanup
Under 4 KiB; no roster, save, formations or button changes.
