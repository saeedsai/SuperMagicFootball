# Online server deployment handoff

**Status: local deployment package prepared; not deployed.** The repository has a standalone `render.online.yaml` Blueprint for a separate authenticated online API. It deliberately leaves the existing LAN signal service untouched. Recommended $0 prototype stack: Render Free web service for Node/WebSocket, Supabase Free Postgres for durable account data, and Auth0 Free for OIDC sign-in. These free services have sleep/pause and data-retention limits, so use them for closed testing, not production player accounts. No cloud resources or identity tenant have been provisioned.

## Recommended free prototype setup

1. Create an Auth0 tenant and a **Single Page Application** using the default Auth0 domain. Create a custom API identifier. Enable Authorization Code with PKCE, use RS256 access tokens, and allow the exact GitHub Pages callback and web origin documented below. The game client needs the issuer, SPA client ID, API audience, and callback URL; it does not need a client secret.
2. Create a Supabase Free project for PostgreSQL. Use its **session pooler** connection string for the Render service and include `sslmode=require`. Free projects have no automatic backups and may pause after a week of low database activity.
3. Commit and push the backend/client code and `render.online.yaml` on `dev`, then create a new Render Blueprint using that file as the Blueprint path. It provisions only `supermagicfootball-online-api`. Choose **Free** and provide the `sync: false` values through the Render dashboard: Supabase Postgres URL, Auth0 issuer (including its final `/`), API audience, JWKS URL (`<issuer>/.well-known/jwks.json`), and exact allowed game origin (`https://saeedsai.github.io`). Never sync this Blueprint against the existing LAN signal service.
4. Configure `online-config.js` in the game build with the API URL `https://supermagicfootball-online-api.onrender.com`, the same Auth0 issuer and API audience, the public SPA client ID, and callback `https://saeedsai.github.io/SuperMagicFootball/`. Add that callback and the origin to the Auth0 application settings. Deploy the game frontend after the API health check and two-account staging checks pass.
5. Before storing real player data or launching publicly, move to always-on compute with managed durable Postgres, automatic backups and a restore drill. Keep purchased-token checkout off the free prototype.

### Free-tier limits

- [Render Free](https://render.com/docs/free) supports HTTP and WebSockets but spins down after 15 minutes without inbound traffic; a sleeping service takes about a minute to wake. Active game WebSocket traffic keeps it awake. It has one instance, an ephemeral filesystem, and may restart. Render itself says Free services are for previews and hobby projects, not production.
- [Supabase Free](https://supabase.com/pricing) currently provides 500 MB Postgres storage and 5 GB egress with no automatic backups; [low-activity projects may be paused after seven days](https://supabase.com/docs/guides/platform/free-project-pausing). Auth0, not Supabase Auth, provides sign-in in this setup.
- [Auth0 Free](https://auth0.com/pricing) currently allows up to 25,000 monthly active users. Plan limits and pricing can change, so check the account before inviting testers.
- Active matches and matchmaking queues remain process-local. Same-process reconnect works, but server restart recovery and multi-instance coordination are not implemented. Treat matches as disposable during maintenance.

## Service inputs

Set these in the hosting provider's encrypted environment/secrets panel. Do not put real values in `.env`, source control, issue reports, or logs.

| Variable | Required value |
| --- | --- |
| `PORT` | Provider-assigned TCP port, integer `1`–`65535`. |
| `DATABASE_URL` | PostgreSQL URL with host, username, password, and database. Treat as a secret. |
| `NODE_ENV` | Set to `production` in production. |
| `SMF_DATABASE_SSL` | `verify-full` when the database CA/hostname can be verified; otherwise use the provider's documented encrypted connection mode `require`. Production rejects `disable`. If `DATABASE_URL` has `sslmode`, it must agree with this value. Certificate file query parameters are unsupported. |
| `SMF_OIDC_ISSUER` | Exact issuer string configured by the chosen identity provider. The browser and server issuer must match exactly. |
| `SMF_OIDC_AUDIENCE` | Exact API audience for access tokens issued to this service. |
| `SMF_OIDC_JWKS_URL` | Identity provider's HTTPS JSON Web Key Set URL. |
| `SMF_ALLOWED_ORIGINS` | Comma-separated list of 1–8 exact HTTPS origins, with no path, such as `https://game.example.org,https://staging.example.org`. These are browser game origins, not the API URL unless the game is hosted there too. |

The current TLS modes are deliberately explicit: `verify-full` checks the database certificate; `require` encrypts but does not verify the server certificate. Follow the selected database provider's current connection instructions and prefer verified TLS when supported. Do not expose the Node HTTP listener directly to the public internet: terminate HTTPS/WSS at a trusted proxy/load balancer, forward only to this service, and preserve WebSocket upgrades for `/api/v1/matches`.

The browser also needs a separately registered OIDC client and redirect configuration in the game build. The callback URL, issuer, client ID, audience, provider CORS policy, and allowed game origins must agree. Never ship a client secret in the browser; this client uses authorization code with PKCE.

## Database setup, backups, and recovery

At startup the service executes the idempotent DDL in `scripts/online-account-schema.sql`. Review that file as the schema migration source and back up the database before deploying any future non-idempotent schema change. Use a dedicated database and least-privilege role; retain encrypted, provider-managed backups with access limited to operators.

Before enabling accounts, configure automatic backups and a retention window appropriate to the selected provider. Perform a restore drill into a separate, isolated database: stop or isolate the API, restore the backup, start a test instance against the restored database, verify account/profile and Career/Ultimate Team snapshot reads and writes, then discard the test instance. Record the restore point, duration, and outcome. Do not restore over an active production database without a reviewed recovery plan.

The API has an in-memory per-account limit of 120 reads and 30 writes per 60 seconds, with a 10,000-account limiter map. The matchmaker has process-local limits of 512 pending tickets, 256 queued users, and 64 active matches; tickets expire after 30 seconds and queue entries after 60 seconds. WebSocket/HTTP connection caps are also process-local. These protect one service process only: multi-instance deployments need shared or edge request limits and coordinated queue/session capacity before scaling horizontally. Queue tickets and active matches are lost on process restart; durable results, Career fixture progression, UT ownership and result token awards remain in PostgreSQL.

## Start, health, and stop

Install the locked dependencies using the repository's normal deployment build, then start with `npm run serve:online`. The service binds to `0.0.0.0:$PORT`. It serves only the account API and match WebSocket; it does not host the game frontend.

Configure the provider health check as `GET /healthz`. It returns `200` only when PostgreSQL answers `SELECT 1`, otherwise `503`. The endpoint does not prove identity-provider reachability, WebSocket routing, backups, or match readiness.

On shutdown, send `SIGTERM` (or `SIGINT`) and allow the service's graceful close to finish. It closes match transport and in-memory matches, stops accepting HTTP, and closes the PostgreSQL pool. In-flight matches are not resumed after restart.

## Owner deployment checklist

- [ ] Provision the prototype's Render, Supabase, and Auth0 accounts; configure credentials only in provider consoles. For production, replace the free-tier stack with always-on hosting and backed-up database.
- [ ] Verify production `NODE_ENV`, PostgreSQL TLS mode, exact HTTPS issuer/JWKS/audience, registered browser callback, and exact allowed origins.
- [ ] Confirm the game frontend is configured with the matching public OIDC/API settings; keep online UI disabled/unavailable until this service is healthy.
- [ ] Start a staging instance, confirm `/healthz`, API auth failures, account isolation, Career/UT snapshot version conflicts, ticket issuance, WebSocket upgrade, and two authenticated clients on separate networks.
- [ ] Configure database backups, complete an isolated restore drill, and record its evidence.
- [ ] Test SIGTERM during idle and active sessions; verify the bounded same-process reconnect and document that active matches do not survive restart.
- [ ] Review rate limits, process-local queue limits, abuse monitoring, privacy/retention policy, and incident response for the chosen scale before inviting users.
- [ ] Record the deployed commit, configuration names (never secret values), provider health result, test accounts used, and remaining acceptance gaps.

The service persists account snapshots, online UT catalog ownership/purchases/lineups, Career seasons/fixture results, and result-derived token rewards, while active matches remain process-local. It does not yet recover active matches after restart or coordinate shared multi-instance matchmaking, and has no real-network acceptance. Same-process reconnect uses a short authenticated one-use ticket to restore the disconnected account to its side and latest authoritative snapshot; expiry closes without settling a result. Terminal results are immutable and available through account-scoped history; Career progression is tied to the matching durable fixture result. Online UT lineups use canonical player IDs, role/ownership validation, optimistic versions and idempotency, and are included in match tickets. Passing the deployment checklist does not by itself establish production readiness.
