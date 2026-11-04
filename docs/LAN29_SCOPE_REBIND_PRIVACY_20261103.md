# LAN29 active-room visibility scope hardening

## Change

The hosted signaling broker now rejects a same-host registration that tries to change an active room between `lan` and `internet-p2p`. Previously, it updated the listing flag from the requested scope but retained the room's original scope, which could publish a room that had been intentionally private. A rejected re-registration leaves the original room and visibility unchanged.

For hosted Internet rooms, `public` must be a boolean when supplied. Malformed values such as the string `"false"` are rejected without creating or changing a room. `public: false` remains private, `public: true` explicitly lists the room, and an omitted value remains publicly listed for compatibility with legacy clients that predate the privacy preference.

## Validation

- `node --test tests/lan_server_listing_policy.test.cjs tests/lan_signal_policy.test.cjs`: **14/14 passed**.
- `node --test 'tests/lan*.test.cjs'`: **432/432 passed**, including actual local hosted-broker registration, directory-snapshot, and announcement checks.
- `git diff --check`: run after the implementation; no whitespace errors.

The regression uses a local hosted-mode WebSocket broker and browser-origin allowlist. It verifies malformed choice rejection, private listing, scope-rebind rejection with no accidental announcement, same-scope opt-in, and legacy omitted-field visibility. This is local protocol behavior coverage; it does not verify deployment, authentication, public-host load, physical devices, or remote-network behavior.
