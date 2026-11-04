# LAN broker monotonic join TTLs — 3 November 2026

## Change

The LAN signaling broker now measures join-request approval and replay-protection windows with a monotonic elapsed-time clock. A wall-clock correction or rollback therefore cannot extend a pending host decision or keep a replay ID reserved longer than the configured 30 seconds. Rate-limit timestamps remain wall-clock based and no signaling fields or TTL values changed.

## Validation

- Focused broker/clock/replay tests: **6/6 passed**.
- Full `node --test 'tests/lan_*.test.cjs'`: **370/370 passed**.
- `git diff --check`: passed for the scoped change.
- Deterministic regression covers fractional samples, a backward sample and invalid later samples; broker wiring checks confirm pending creation, decision expiry, periodic cleanup and replay use the monotonic clock.

Hosted service behavior, real network recovery and physical-device acceptance remain separate.
