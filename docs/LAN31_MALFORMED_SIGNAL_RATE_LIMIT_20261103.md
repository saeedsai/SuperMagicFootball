# LAN31 malformed signaling rate limit — 3 November 2026

## Acceptance criteria

- Malformed JSON and malformed packet shapes consume the existing per-connection signaling message budget instead of bypassing it.
- The same limit and close behavior apply to valid non-relay signaling packets; relay frames keep their independent frame/byte budgets.
- Oversized signaling frames are explicitly rejected with WebSocket close code 1009.
- A local real-WebSocket test floods malformed JSON and verifies the 121st message is closed with the existing 1008 rate-limit code.

## Change

The LAN server previously parsed inbound JSON before charging its signaling message budget. JSON parse failures and objects without a supported packet shape returned early, allowing repeated malformed frames to avoid the 120-message-per-minute guard. Those invalid control frames now count toward the existing counter. Relay frames still use their separate relay limits and are not charged twice. Frames above the configured WebSocket payload cap are explicitly closed as too large.

## Validation

- `node --test tests/lan_server_malformed_rate_limit.test.cjs tests/lan_server_connection_cap.test.cjs tests/lan_server_relay_budget.test.cjs` — **3 passed, 0 failed**.
- This test starts the actual local LAN server and sends malformed signaling over WebSocket; it does not certify hosted deployment, malicious network conditions, or physical-device behavior.
