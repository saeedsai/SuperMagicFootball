# Candidate 0.12.81.31 validation — 4 November 2026

## Delivered locally

- Online Career can start a server-owned season for a team the account owns. The server creates eight unique fixtures, exposes the fixture list and standings, and issues the next fixture ticket with the match ID, team and human participant side bound server-side. The opponent is simulated by the server CPU; online PVP remains a two-human mode.
- Career progression accepts only the durable terminal result for the exact pre-bound fixture and is idempotent. A duplicate or mismatched result cannot advance the schedule.
- Online Ultimate Team APIs provide an authenticated canonical catalog, owned collection and server-priced/idempotent purchases for existing teams and players using server soft tokens. The current local-squad copy flow remains separate. Selecting acquired players into a validated Online UT lineup is still outstanding.
- Match reward claims remain authenticated, participant-checked, result-derived and duplicate-safe. Token quantities are never accepted from the client, and real-money purchases are not implemented.
- Browser UI exposes the Career season and fixture flow, owned-team selection, UT collection/purchases and PVP. It retains the existing four actions and leaves offline saves independent.

## Validation run

- `npm run test:node`: **2,152/2,152 Node tests passed**, and the club runtime integrity fixture passed.
- Focused online account, Career, matchmaking, match, reward and Ultimate Team suites: **159/159 passed**; account-service Career lifecycle/order/retry suite: **1/1 passed**.
- `python tests/online_account_ui_browser_qa.py`: **passed** for optional config, PKCE callback, server Career season/fixtures/standings and CPU match, UT copy/purchase retry, PVP, four-action input, rewards, offline-save preservation and accessible status.
- Integrated build output: **5,114,881 JavaScript characters / 5,237,253 HTML characters**.
- Browser API/OIDC/WebSocket boundaries are mocked. These checks do not certify a live database, identity provider, external network, multiple devices, accessibility hardware or visual approval.

## Remaining online work and external gates

- Build and validate an Online UT lineup from account-owned player entitlements and use the roster in online matches.
- Add active-match reconnect/recovery and evaluate shared queue/session/rate-limit state before horizontal scaling; current active sessions are process-local and disappear on restart.
- Owner will provide hosting later. Then configure real PostgreSQL and OIDC, apply migrations, test backups/restore, and run two-account/two-device tests across real networks.
- Run exact-head CI, protected promotion and hosted byte smoke for this code before describing it as deployed. None is claimed here.
- Online Career currently competes against server CPU. Online human league/tournament competition is not implemented.
- Keep real-money token sales disabled pending explicit payment/security/product requirements.

The local candidate is ready for further development and the future owner-provided server setup; it is not a deployed or production-accepted online service.
