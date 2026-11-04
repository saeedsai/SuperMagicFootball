# LAN snapshot byte-accounting hot path — 3 November 2026

## Change

`bindLanSnapshotHostChannel` no longer runs a second `TextEncoder` over each validated snapshot just to compute the RTCDataChannel queue budget. `encodeLanSnapshot` already validates every dynamic string as ASCII (room/host IDs, player action names, and Super Shot IDs/colors), and all other fields are numeric or fixed schema keys, so the serialized JSON code-unit count is its exact UTF-8 byte count. The existing byte cap, rejection behavior, and tick cursor rules are unchanged.

## Acceptance and validation

- `node --test tests/lan-snapshot-channel.test.cjs tests/lan-state-snapshot.test.cjs tests/lan_live_match.test.cjs tests/lan-input-timeline.test.cjs`: **59/59 passed**.
- New `LAN-094` regression compares UTF-8 byte length with JavaScript string length on a snapshot exercising IDs, visual actions, hazards, metadata and transformed-shot effect strings.
- Existing simulated DataChannel backpressure tests continue to confirm that over-budget snapshots do not send or advance the tick cursor, and a later fresh snapshot is accepted after drain.

This removes one transient UTF-8 byte buffer allocation per host snapshot. It does not certify real device performance, packet loss, NAT traversal, or hosted multiplayer; those LAN30 acceptance gates remain open.
