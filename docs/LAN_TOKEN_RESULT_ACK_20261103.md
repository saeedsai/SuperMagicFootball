# LAN/P2P terminal token receipt acknowledgement — 3 November 2026

## Change

LAN match results now use a separate optional `result-ack` DataChannel packet. It carries the exact `lan:<roomId>:<hostId>:<32-hex-matchId>` receipt ID and is bound to the established LAN protocol session. The packet schema rejects unknown fields, malformed IDs, nonzero ACK sequence values, and wrong sessions. ACK traffic does not consume the contiguous four-button input sequence or enter the host frame queue.

The guest sends the ACK only after its local soft-token wallet reports a saved receipt or an already-recorded duplicate. Repeated finished snapshots retry the ACK; wallet receipt de-duplication prevents another payout. The host accepts only the exact receipt for its current room, host, and match. It pays once after the host snapshot transport accepts the result and either a matching ACK arrives or the bounded **3 second** fallback expires. Without a matching ACK, the payout status is `unconfirmed`; this preserves compatibility with older peers that ignore the optional packet.

This is a local, host-authoritative soft-token flow. The receipt and ACK are not account authentication, server settlement, tamper-resistant proof, or a secure competitive ledger. No hosted service, two-device/network, physical-device, or deployment acceptance is claimed.

## Validation

- Focused coverage in `tests/lan-token-result-ack.test.cjs` checks strict wire shape/session validation, end-to-end peer API delivery, no control-sequence mutation, durable guest receipt before ACK, exact-match rejection, duplicate ACK/result idempotency, bounded unconfirmed fallback, and legacy-peer fallback.
- LAN live-match, protocol-channel, and peer-connection focused suites passed **98/98** when run with `node --test tests/lan-token-result-ack.test.cjs tests/lan_live_match.test.cjs tests/lan-protocol-channel.test.cjs tests/lan_peer_connection.test.cjs`.
- Complete LAN/P2P Node suite passed **439/439** with `node --test tests/lan*.test.cjs tests/lan-*.test.cjs`.
- `git diff --check` passed for the owned source/test files.

## Remaining acceptance

Test a current build between independent physical devices and real network paths, then separately verify exact-candidate hosted service and deployment behavior. These remain external acceptance gates.
