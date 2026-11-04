# LAN signaling global connection budget

**Date:** 2 November 2026  
**Scope:** Bound pending WebSocket handshakes and connected signaling clients before heartbeat scans.

The LAN signaling server now admits at most **256 total** pending or live connections by default. `LAN_MAX_CONNECTIONS` may lower or raise the total up to 4,096. The existing maximum of eight connections per source IP is enforced by the same reservation budget, including handshakes that have not yet emitted a WebSocket `connection` event. Capacity is released on socket close or a failed upgrade, allowing later clients to connect. Invalid limits fail during server startup.

Validation:

- `node --test tests/lan_connection_budget.test.cjs tests/lan_server_connection_cap.test.cjs tests/lan_signal_policy.test.cjs`: **17/17** passed.
- A real local broker test starts the server with a two-connection cap, verifies the third handshake receives HTTP 503, closes a client, and confirms a replacement connection succeeds.

This caps local server memory/heartbeat work but does not establish hosted load, abuse, or physical-network acceptance.
