# Supermagic Football v0.8.22.1 — Changelog

- **Breaking input grammar rework (intentional):** loose aerial ball + Jump → one/two Dribble = ordinary/Super Bicycle; loose aerial ball + Jump → one/two Shoot = ordinary/Super Header.
- Carrying player Jump then Shoot is elevated ordinary, Double Jump then Shoot is Super Shot.
- All three Super versions share the exact same transformed ball style and shot speed/strength for equivalent shooter/shot state.
- Defensive/non-shot specialists use a stronger ordinary untransformed attack when entering super-command sequences; player-tier eligibility remains future-only.
- Backlog-preserved stationary ball lift still feeds the new aerial combinations. The previous lift → Jump+Shoot Super Bicycle contract is retired.
- Added a 320ms double-tap buffer, shot cancellation on lost reach/possession/stun, and unique header/bicycle player animations.
- Revised in-game Help, bumped offline service-worker cache key, added new automated unit + desktop/simulated-touch browser QA, adapted obsolete fixtures.
- Expanded master QA catalog from 345 to **357** cases. **54/54 Node and 34/34 browser scripts pass** in recorded final runs. Physical devices and one monolithic browser run unverified.
- No routine roster verification work or player-tier restrictions activated. Audio remains next major milestone.
