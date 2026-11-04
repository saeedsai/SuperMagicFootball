# LAN browser leave and rejoin evidence

Date: 2026-11-03  
Target release and browser fixture: version-aligned `.80` shared modular build.

## Scenario

`tests/lan_browser_leave_rejoin_qa.py` launches two headless Chromium contexts and the local LAN signaling broker, then exercises the shipped UI and real WebRTC data channels:

1. Host registers a room; guest discovers it, requests entry, and host explicitly approves.
2. The guest starts a match and uses the in-game Leave Match flow.
3. The departing guest's old channel closes and rejects sends. The host's old channel closes; the broker marks the seat free and keeps the room registered.
4. Host returns to the visible registered-room lobby. The guest submits a distinct join request and the host explicitly approves it.
5. The new match uses a distinct peer connection and data channel. Guest input moves the guest-controlled away-side player only, and both peers converge on player positions, score, and clock.

## Results

- `python -X utf8 tests/lan_browser_leave_rejoin_qa.py` — PASS on `.80`. Output included `newPeerConnections: True`, away-side movement `130.16px`, host-controlled home-side movement `0.0px`, and no browser page errors.
- `node --test tests/lan*.test.cjs tests/lan-*.test.cjs` — PASS, 434/434 tests.
- The focused lobby/peer/seat regressions (`lan_auto_lobby_flow`, `lan_peer_connection`, `lan_guest_release`) passed, 105/105 tests.

The LAN test suite's source-wiring checks were updated to expect the new `onGuestLeft:returnLanHostToLobby` callback for both LAN and Online P2P lobby mounts.

## Limits

This verifies local loopback signaling and Chromium WebRTC only. It does not certify physical devices, hosted service operations, restrictive NAT traversal, Internet connectivity, packet loss, latency, or production deployment.
