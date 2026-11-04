# Candidate 0.12.81.28 — local online mode integration

**Status:** locally validated only. The game is not pushed or deployed, and no hosted server has been provisioned. The owner asked for local development until they provide hosting.

## Delivered in this increment

- In-game Online Server Match route with optional-offline fallback and PKCE sign-in return. A signed-in user requests a one-use ticket, joins server matchmaking, receives a server-assigned side and plays with the existing four actions. Keyboard, touch and gamepad inputs are sampled into the same four-action payload at 30 Hz.
- The client validates the authoritative snapshot shape and maps it through the existing production match renderer. Local physics are not advanced for a server match. The server reports terminal completion only after its immutable result store confirms persistence. Failed result writes retain the match reservation and retry with bounded backoff.
- PostgreSQL match results are immutable/idempotent. Authenticated history uses account-filtered pagination and viewer-relative scores/outcomes without exposing opponent account IDs. The Online Career page can load that read-only history.
- Career and Ultimate Team remain account-scoped, versioned manual-copy features. They do not change offline source saves or active slots. Online Career fixture progression and Ultimate Team acquisition/progression are still open.

## Validation performed

- `npm run test:node`: build passed; **2,086/2,086** Node tests passed; club runtime integrity fixture passed.
- Focused online/API/client/result/matchmaking and release contract suites: **139/139** passed.
- `python tests/online_account_ui_browser_qa.py`: passed with mocked identity/API/WebSocket services. It verifies optional config behavior, actual PKCE redirect handling, local-save preservation, history display, match ticket request, assignment, four-action input, Escape/resume/leave route and no browser page errors.
- `git diff --check`: passed after final edits (see current local run before release integration).

## Not verified

The API/WebSocket boundary is mocked in the browser test. This does not prove two-device or cross-network play. There is no configured identity provider, real production database, owner-provided server, deployment, reconnect/resume, active-match restart recovery, online reward ledger, online Career season advancement, Ultimate Team item ownership/acquisition, purchase flow, shared rate limit, load test, screen-reader acceptance, physical-device acceptance, or owner visual approval. No exact-head GitHub CI or hosted Pages check was run.

## Next local work

1. Implement server-authoritative Online Career fixtures and idempotent standings/season advancement bound to durable match results.
2. Implement account-owned Ultimate Team progression and acquisitions with server-owned prices/entitlements while preserving free/offline content.
3. Add secure reward ledger and reconnect/recovery only after clear server-side policy and idempotent result binding.
4. Continue with the owner-provided server when available, then run the real identity/database/deployment/backup and two-client acceptance gates.
