# LAN29 hosted room discovery privacy

## Acceptance criteria

- New hosted Internet P2P rooms are unlisted by default. The broker must omit them from both unsolicited announcements and room snapshots.
- Hosting displays the room's existing 128-bit random room ID in a dedicated copyable invite-code field. Online clients can paste that code to request admission even when the room is absent from discovery.
- Host approval remains mandatory for every invite-code join. The invite code grants a request, not automatic match access.
- The lobby offers an explicit public-listing choice. Only hosts who opt in appear in global hosted discovery.
- Same-network LAN rooms remain discoverable on the LAN and existing host/join behavior remains compatible.
- Tests cover the actual hosted signaling broker and the browser lobby paths for hidden, public, direct-code, and approval behavior.

## Security boundary

The code is the existing 128-bit random room ID (`room_` plus 32 cryptographically random hexadecimal characters). It is a bearer invitation; anyone who receives it can request approval. Host approval still gates admission. This reduces unsolicited directory exposure and is not account authentication, encryption of lobby metadata, rate-limit certification, or a claim of same-Wi-Fi hosted discovery. Copying or sharing the code outside the intended group remains possible.
