# LAN relay ingress byte budget

**Date:** 2 November 2026  
**Scope:** Hosted Internet P2P signaling relay, local source-tree acceptance only.

The LAN signaling broker now enforces a **512 KiB inbound relay-wire budget per peer for each one-second relay window**, alongside the existing 90-frame-per-second limit and the 24,000-byte per-frame payload cap. Both relay counters reset together. When either limit is exceeded, the broker closes that sender with WebSocket policy code 1008; the receiving peer and unrelated rooms stay connected. Non-relay signaling continues to use its separate 120-message/minute limit.

The byte counter uses the complete incoming WebSocket message size, so JSON/envelope bytes count toward the budget as well as the encoded relay payload. The limit bounds ingress handled by this broker; it does not measure peer network throughput or establish hosted-service capacity.

`tests/lan_server_relay_budget.test.cjs` starts the actual local broker in hosted signaling mode, creates an approved relay room, verifies a normal frame is forwarded, sends enough traffic to exceed the byte budget, then verifies the sender closes while the receiving peer remains open and receives the valid prefix. Focused LAN coverage passed **47/47**.

This is not a deployment, hosted load, NAT, or two-device acceptance claim. The hosted broker is still unconfigured and requires separate owner-authorized infrastructure and external validation.
