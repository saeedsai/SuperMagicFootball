# LAN protocol reliability notes

## LAN29 hosted room privacy and invite codes

New Internet P2P clients register rooms as unlisted by default. The host sees the existing cryptographically random room ID as an invite code. A guest can submit that code directly, including when no directory card exists; the broker routes it through the same pending-request and host-approval path. The lobby has an explicit public-listing checkbox. Switching an active room from public to private removes its directory card, and private rooms are excluded from unsolicited announcements, reconnect announcements and room snapshots. Legacy clients that omit the listing choice keep their prior public behavior. This is directory privacy only: invite codes are bearer secrets, not accounts or authentication, and hosted discovery is not certified same-Wi-Fi-only. See [LAN29 acceptance criteria](LAN_PRIVATE_ROOM_INVITES_20261102.md).

## LAN29/30 global connection budget

The signaling broker now caps all live plus in-progress WebSocket handshakes at **256** by default (`LAN_MAX_CONNECTIONS`, range 1–4,096). The existing eight-per-IP limit uses the same reservation budget, so concurrent handshakes count before the connection callback. Successful handshakes transition their reservation to a live socket without consuming another slot; close and failed-upgrade events release capacity. This bounds the server's client map and heartbeat scan as well as per-source socket use. Unit coverage and an actual local WebSocket-server test verify global rejection, per-IP rejection and capacity recovery after disconnect; see [the acceptance report](LAN_GLOBAL_CONNECTION_BUDGET_20261102.md). It does not establish real hosted load or abuse acceptance.

Hosted Internet P2P relay ingress also has an independent **512 KiB per-peer byte budget per one-second relay window**, in addition to 90 frames/second and 24,000 bytes per frame. The count uses full WebSocket message bytes (including the JSON envelope) and shares the existing relay-window reset. Exceeding either relay limit closes only the sending peer with policy code 1008. The real local hosted-mode broker test verifies approved forwarding, sender closure at the budget, and survival of the receiving peer; see [the ingress-budget evidence](LAN_RELAY_INGRESS_BUDGET_20261102.md). This bound is not hosted load certification.

## LAN30 snapshot backpressure

The host snapshot sender uses the RTCDataChannel's reliable ordered transport. If the peer or network cannot drain snapshots at the simulation rate, queued historical states can accumulate and increase latency. `bindLanSnapshotHostChannel` therefore caps queued snapshot bytes at 64 KiB by default (configurable up to 512 KiB for harnesses). It checks the existing `bufferedAmount` plus the encoded snapshot size before sending.

If the next snapshot would exceed the limit, `send` returns `false` and does not advance `lastTick`. The caller continues simulation and may send a later, fresher snapshot once the channel drains; skipped ticks are not retransmitted as stale state. Invalid or negative channel byte counters also fail closed. This bounds data queued by this sender, while the browser and network still control actual delivery and latency.

`tests/lan-snapshot-channel.test.cjs` exercises a simulated two-peer channel: force the host's queue over the configured limit, confirm that the snapshot and tick cursor are not advanced, drain the queue, and confirm a later snapshot is delivered. This does not establish performance or recovery on physical devices.

Guest-to-host input uses its own **16 KiB** queue limit because delayed controls are time-sensitive. Before `send()`, the guest checks the RTCDataChannel's existing `bufferedAmount` plus the serialized input size. A full queue, or an invalid/negative/unsafe byte count, rejects the frame without calling `send()` or advancing its sequence/frame cursor. When the channel drains, the game loop can retry the same frame and sequence. Legacy channel mocks without a `bufferedAmount` property are treated as an empty queue. `tests/lan_protocol.test.cjs` covers the exact limit, one-byte overflow, invalid counters, and drain/retry behavior. This is a client-side queue bound; it does not establish physical-device or real-network packet-loss acceptance. (LAN-091)

## LAN-092 one-step action retry fidelity

`createLanLiveMatch` treats a refused, throwing, or ambiguous guest send as nonfatal and does not advance its last-sent frame. It now retains at most one set of just-pressed action edges (`PASS`, `SHOOT`, `DRIBBLE`, `JUMP`) so a one-step action can survive transient queue backpressure. On retry, it rebases the edge to the latest valid host lead frame; continuous held buttons and analog axes are sampled fresh. New press edges merge into the single pending set. The pending edges expire after 250 ms or three total failed sends, and are cleared on stale host snapshots, pause/finish, or transport reset. Thus a transient queue refusal cannot cause an unbounded backlog or replay a stale action. `tests/lan_live_match.test.cjs` covers a rejected one-step `JUMP`, a new `PASS` while retry is pending, fresh-frame rebasing, and age/attempt expiry. Real two-device behavior still requires external acceptance.

## LAN30 input sequence poisoning

The host accepts input sequence numbers contiguously, starting at zero for each guest admission. The guest sender already emits this sequence, and LAN input uses a reliable, ordered RTCDataChannel. A skipped number therefore indicates malformed or hostile traffic rather than ordinary packet loss. Previously, any larger safe integer advanced the host cursor; a guest could send `Number.MAX_SAFE_INTEGER` once and make every subsequent legitimate input stale until reconnect.

The host now rejects a sequence jump without changing session state or applying the controls. The same connected guest can then continue with its next expected number. `tests/lan-host-adapter.test.cjs` simulates both ends: a guest sends the maximum safe integer, then sequence zero and sequence one; the forged jump is rejected and normal controls still reach host ticks.

## LAN29/30 host approval replay memory

The host approval controller already capped concurrent join prompts, but its decided-request replay table had only a TTL. A fast stream of unique requests that were each decided could therefore grow that table without bound during the TTL window. The controller now caps the combined number of pending plus replay-protected request IDs at 64 by default (configurable from the pending limit through 512). At the bound, it fails closed on new requests until an existing prompt expires or a decision's replay window expires; it never evicts an unexpired decision to make room. This preserves duplicate suppression while bounding memory.

`tests/lan_host_replay_bound.test.cjs` fills a small configured bound with one decision and one pending request, verifies a new ID is rejected, finishes the pending decision, verifies the table remains full, and confirms capacity recovers at TTL expiry. Configuration smaller than `maxPending` is rejected. Focused LAN host approval tests pass 18/18. This is a client-side bounded-memory safeguard; signaling identity/authentication and physical-device LAN acceptance remain separate.
