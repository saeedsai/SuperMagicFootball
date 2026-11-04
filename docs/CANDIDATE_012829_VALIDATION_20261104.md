# Candidate 0.12.81.29 — server-bound online team selection

**Status:** local development candidate. No push, deployment, hosted server or production database was used; hosting waits for the owner to provide a server.

## Delivered

- The Online Server Match screen lets a signed-in user choose from the game/server's supported canonical playable teams.
- The authenticated ticket endpoint accepts only an optional single-field `{ "teamId": "…" }` JSON request, capped at 1 KiB. IDs are checked against the server's canonical playable catalog before a one-use ticket is issued.
- Ticket-bound team choices survive queueing and are assigned in authoritative side order; queue input cannot replace them. The server engine validates team IDs and includes the real team IDs in its snapshots and durable result.
- The HTTP adapter streams bounded ticket JSON and still permits legacy ticket calls with no body.
- Offline local games and saves, the four-action payload, and local account-copy flows remain available.

## Validation performed

- Focused online API/HTTP/client/service/engine/matchmaking tests: **74/74 passed**.
- `python tests/online_account_ui_browser_qa.py`: passed with mocked OIDC/API/WebSocket boundaries, selected-team POST, four-action input, local-save preservation and no browser page errors.
- `npm run test:node`: build passed; **2,091/2,091** Node tests passed; the club runtime integrity fixture passed.
- `git diff --check`: passed (Git reported only line-ending normalization warnings for existing Windows-working-copy files).

## Remaining gates

The browser service boundary is mocked; real two-account and cross-network play are not verified. Online Career season progression, Ultimate Team inventory/acquisition, online reward settlement, reconnect/crash recovery, shared rate limiting, real OIDC/database configuration, load/abuse testing, owner-provided hosting, backup/restore, two-device acceptance, exact-head CI, deployment, owner visual review and physical-device acceptance remain open. See [online server foundation](ONLINE_SERVER_FOUNDATION_20261104.md) and [server deployment handoff](ONLINE_SERVER_DEPLOYMENT.md).
