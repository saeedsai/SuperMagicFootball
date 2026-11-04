# LAN rate-window monotonicity — 3 November 2026

## Change

The LAN signaling broker already used a monotonic elapsed-time clock for join approval and replay expiry, but its general signaling-message and relay-byte windows still used `Date.now()`. A local system-clock correction could therefore hold a client's message budget open after a backward jump or reset an active relay budget after a forward jump.

Both rate windows now use the same monotonic broker clock. Per-peer limits remain unchanged: 120 signaling messages per 60 seconds, 90 relay frames per second, 512 KiB relay bytes per second, and the existing per-frame payload cap. This changes no wire format, room policy, game controls, wallet state, or client UI.

## Validation

`node --test tests/lan_server_monotonic_rate_window.test.cjs tests/lan_monotonic_clock.test.cjs tests/lan_server_malformed_rate_limit.test.cjs tests/lan_server_relay_budget.test.cjs` passed **6/6**. Two real local signaling-broker tests use a test-only preload to advance monotonic time independently of wall time: a backward wall-clock jump does not freeze the 60-second signaling window, and a forward jump cannot clear an almost-full relay-byte window. Existing malformed-message closure and approved-peer relay-limit/isolation checks still pass.

The clock preload exists only under `tests/fixtures`; production uses Node's `performance.now()`. This does not certify public hosted load, external networks, or device behavior.
