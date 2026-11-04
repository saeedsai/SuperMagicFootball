# LAN29 join-request expiry clock safety — 3 November 2026

## Change

`createLanJoinRequests.receive()` now samples one clock value and uses that same timestamp for pruning, accepted-time metadata and pending/replay expiry. The sample and computed expiry must be safe integers before any state is changed. A clock jump between calls can no longer extend a host-approval request beyond its configured TTL; unsafe time or addition overflow rejects fail-closed.

The wire format, configured TTL and stable-clock approval behavior are unchanged.

## Validation

- Focused join-request and host-approval suites: **34/34 passed**.
- Deterministic advancing-clock coverage reproduces the former overlong-approval window and confirms expiry at the intended time.
- Invalid clock and unsafe TTL-addition cases reject without mutating pending/replay state.
- Modular build and scoped `git diff --check` passed.

Real hosted signalling, two-device, restrictive-NAT and deployment checks remain separate.
