# Candidate 0.12.81.34 — local validation (4 November 2026)

## Scope

- Unexpected PVP transport loss pauses the authoritative same-process match for 15 seconds. A new authenticated one-use ticket is bound to the disconnected account and existing match; successful reconnection restores the original side and latest snapshot and resets that seat's input sequence. No result or reward is committed while disconnected or when grace expires. Intentional leave remains immediate; Online Career retry behavior is unchanged.
- Classic gameplay ball panels use a perspective-projected curved surface at the existing 17-unit match radius. The renderer rotation API, ball physics, hitboxes, cosmetic ball models and gradient-free fallback are unchanged.
- Fixed the Online Ultimate Team remote-squad reload action to call its actual server snapshot loader. The browser flow verifies the no-remote-squad path and initial save.

## Validation run

- npm run test:node: build passed (5,134,136 JavaScript / 5,256,929 HTML characters); 2,186/2,186 Node tests passed; club runtime integrity fixture passed (32 clubs, 384 player slots).
- Focused account API/client/HTTP, match session/client, matchmaking and WebSocket suites: 126/126 passed. Includes authenticated ticket issuance, account and match binding, single-use/replacement and expiry, paused same-match recovery, original seat and snapshot, input resumption, timeout without settlement, immediate intentional leave, and unchanged Career retry behavior.
- Release/version and keeper/art contracts: 19/19 passed.
- python3 tests/online_account_ui_browser_qa.py: passed. Mocked provider/service flow covers PKCE callback, Online Career season/archive/fixture and standings, UT purchase and lost-response lineup retry, remote squad reload, PVP lineup binding and reconnect, four-action input, token reward and offline-save preservation.
- python3 tests/game_ball_surface_render_browser_qa.py: passed with no page errors; verified featured and gameplay-scale balls, 0°/45°/90° turn samples, classic radius 17, cosmetic radius 84, and four airborne shadow heights. Capture: [ball panel projection](evidence/browser/ball_panel_projection_20261104.png).
- git diff --check: passed; Git emitted existing working-copy line-ending notices only.

## Hosting and remaining gates

This candidate is local and **not deployed**. Render account inspection found an existing free LAN signaling web service but no PostgreSQL database. Render's free web instances can spin down after 15 minutes without inbound HTTP/WebSocket messages, and its free PostgreSQL database expires after 30 days; those limits are acceptable for a disposable prototype only, not durable Career/UT token progress. The browser's public OIDC/API configuration is still blank, so sign-in cannot work yet. No live PostgreSQL/OIDC, real-network or two-device acceptance, crash recovery, multi-instance matchmaking, backup/restore drill, load/abuse trial, exact-head CI, protected promotion, or hosted smoke is claimed. The owner must provide trusted OIDC issuer/audience/JWKS and browser client/redirect settings plus a chosen durable database/host before secure online access can be enabled. No real-money purchase flow is enabled.

Deployment preparation completed locally after these tests: `render.yaml` now adds a separate Render Free account/match API service and preserves the existing LAN signal service's Free plan. `docs/ONLINE_SERVER_DEPLOYMENT.md` documents a free closed-test stack using Supabase Postgres and Auth0 OIDC. Blueprint validation, cloud account setup, configured secrets, push, deployment and live acceptance remain open.
