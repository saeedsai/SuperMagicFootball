# Candidate 0.12.64 local integration — 3 November 2026

## Change

LAN29 host join-request approval now uses one validated clock sample for pruning and TTL calculation. Unsafe clock values and expiry overflow fail closed without mutating request/replay state. Stable-clock behavior, configured TTL and wire format remain unchanged.

## Validation

- Full local Node suite: **1,816/1,816 passed**, followed by the club fixture.
- Data validation: **223 teams, 2,676 players, 84 avatar presets; zero errors**.
- Versioning policy contract: **16/16 passed**.
- Focused LAN join-request and host-approval tests: **34/34 passed**, including clock-jump expiry, expired approval rejection, invalid-clock rejection and safe-integer overflow without state mutation.
- Modular build and scoped `git diff --check` passed.

The broad portable-Chromium census was not rerun: the previous `.62` run remained unaccepted after repeated unrelated local page-load timeouts. This candidate's server/request-expiry change is covered by deterministic host unit tests; hosted signalling, physical two-device behavior and network deployment remain separate.

Focused evidence: [LAN29 clock-safe request expiry](LAN_JOIN_REQUEST_EXPIRY_CLOCK_20261103.md).

## Release limits

No hosted deployment, physical two-device, exact-head CI or production readiness is inferred from local unit tests.
