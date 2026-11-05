# Candidate 0.12.81.47 — local validation (5 November 2026)

## Changes

- Existing procedural players counter-lean their connected torso/arms/head around the waist during sharp turns. This uses the renderer's existing eased heading lag and mirrors by view side. Movement, collision, leg pose, view selection, and timers do not change.
- Online fixed-tick callbacks now accept synchronous result objects and asynchronous persistence Promises. An unexpected timer-boundary error closes only that match, frees participants, and resets Career for retry without recording a result or reward. A bounded operator event logs only a validated opaque match ID and a fixed error code.
- Online Career fixture launches acquire a short database-time lease inside a transaction. The claim is bound to the authenticated account and stable fixture/match IDs; another service instance cannot claim the same fixture while the lease is active. A failed ticket setup conditionally releases the lease and its local matchmaking reservation. Durable completion clears lease fields.

## Local checks

- Build: **5,178,419 bundled JS characters / 5,301,431 HTML characters**.
- Full `npm run test:node`: **2,244/2,244 Node tests passed**; Club26/FC27 executable passed (32 clubs / 384 slots, 2/3/4/3; FC27 editorial 12).
- Focused online Career/API/matchmaking/WebSocket/session suite: **114/114 passed**. Release and version contract suites: **16/16 passed**.
- Turn/shot renderer unit checks: **8/8 passed**. Actual production renderer Chromium QA captured **40 frames** (five transition samples × eight headings), with at least 3,383 painted pixels per sample, no page errors, and unchanged live player/ball state. Existing run gait Chromium QA passed **288 frames** across eight views and three speeds.
- `git diff --check` passed.

The Career cross-instance race and lease expiration are covered by independently constructed service instances sharing a serialized fake database. The current environment has no PostgreSQL service or binary, so applying the migration and testing lock behavior against real PostgreSQL remains open. A ten-minute lease has no renewal heartbeat; a stalled match beyond lease expiry can be reclaimed. Public OIDC/database configuration, two real online clients, live-host failure drills, owner visual acceptance, and physical-device acceptance are not claimed.

## Exact-head and hosting gates

Candidate .47 SHA `c14314ef9ce04709b4bbf7f3e6a77a8919e847ae` was pushed to `dev`. Full Regression Census [41986894087](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41986894087), Modular QA [41986894241](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41986894241), and current-player graphics QA [41986894077](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41986894077) passed. Protected promotion reached `main`; Pages deployment [41988039780](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41988039780) passed. Main Census [41988039900](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41988039900) is still running. A separate hosted byte smoke and human/device acceptance are not claimed.

For context, previous candidate .46 SHA `6d76e3e936c41433aca8e8f1b20c108b6e4f4d01` passed exact-head Full Regression Census on same-SHA retry and Modular QA; the protected Pages deployment and main regression also passed. See run links [dev census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41982684040), [Modular QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41982684016), [Pages deployment](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41984762507), and [main census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41984761959).
