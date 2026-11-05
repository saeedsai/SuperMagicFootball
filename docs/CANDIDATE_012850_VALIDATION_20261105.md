# Candidate 0.12.81.50 validation

**Status: local candidate.** This report records only the current local evidence. No exact-head GitHub gates, protected promotion, Pages deployment, customer-host backend, device acceptance, or owner visual/gameplay approval are claimed.

## Changes in this candidate

- Soft-token exact match receipts and wallet state now use a transactional IndexedDB store. Existing schema-1 localStorage wallet data is validated and migrated without deleting the original source bytes. Awards, receipts, and purchases are committed atomically; duplicate-receipt awards are idempotent. When IndexedDB is unavailable, token rewards and purchases fail closed while offline play can still boot.
- LAN match rewards use the durable wallet. After a delivered terminal result, the host's bounded fallback remains available if the guest reloads before sending the receipt ACK. The host and guest each receive one receipt; an undelivered terminal snapshot still cancels settlement. This is peer-to-peer client behavior, not server-verified reward settlement.
- Career slots detect stale cross-tab writers and refuse to overwrite bytes changed since the current tab loaded them. The stale tab retains an exportable last-trusted snapshot.
- Match-ball panel artwork is projected over a renderer-only rolling sphere mesh using the existing ball travel vector and roll angle. Simulation state, physics, options, ball radius, and the fallback renderer are unchanged.
- The local account API durably records match assignment before publishing it, exposes authenticated bounded PVP lifecycle status reconciliation, commits the immutable result and completed lifecycle together, and recovers completed results or marks no-result assignments interrupted on startup under the singleton database lock. It does not resume an active simulation after process restart.

## Local validation

Focused offline validation:

- Economy, Career stale-writer, save import/export guards, LAN live-match/reward, and local reward commit-gate suites: **86/86 passed**.
- Authenticated online account API/client/HTTP/runtime/history/matchmaking/result-store/lifecycle suites: **160/160 passed**.
- Ball surface and shot-impact renderer suites: **11/11 passed**.
- LAN result ACK lifecycle and recovery subset: **12/12 passed**; LAN lobby integration checks: **15/15 passed**.
- Release/version contracts: **16/16 passed**; combined release plus LAN lobby structural checks: **31/31 passed**.
- Guest reload-before-ACK browser scenario: passed locally after waiting for the existing 3-second bounded fallback; confirmed host and guest wallets each have one exact receipt and expected 30/20 tokens. The scenario is run with `SMF_ACK_BROWSER_RELOAD_BEFORE_ACK=1`.
- LAN result browser evidence: [host receipt acknowledgement](LAN_TOKEN_RESULT_ACK_HOST_LIVE_20261105_50.png), [host manual recovery after four refused writes](LAN_TOKEN_RESULT_ACK_HOST_MANUAL_RECOVERY_20261105_50.png), [guest reload recovery](LAN_TOKEN_RESULT_ACK_GUEST_RELOAD_20261105_50.png), and [storage retry](LAN_TOKEN_RESULT_ACK_STORAGE_RETRY_20261105_50.png). These are automated local captures, not owner visual acceptance.
- Ball rolling browser QA: 60 samples across five ball designs, four headings, and three roll angles; renderer-only state invariants and no browser errors. Gallery: [rolling ball projection](evidence/browser/ball_rolling_projection_012850.png).

Integrated local validation passed: build **5,214,574 JS / 5,337,586 HTML characters**; full Node **2,276/2,276**; Club26/FC27 fixture; and `git diff --check`. Chromium paths passed for Online Career/Ultimate Team/PVP UI, Store desktop/touch/keyboard, Save Export/Import round-trip desktop/touch, LAN ACK and disconnect, guest reload before ACK, guest storage-failure retry, host storage retry after 1 and 3 injected writes, and manual host recovery after 4 injected writes. Every LAN result case confirmed one durable receipt on each device and 30/20 token balances; the four-failure manual case confirmed no premature host receipt, accessible recovery, and one receipt after user retry. Full save export has an exact 64 MiB guard and safely refuses larger archives without truncating or omitting sections; the independent wallet cap is not a guarantee that every combination of all local save sections fits under that complete-archive limit.

## Hosting and acceptance still open

- Render workspace currently has only the free LAN signaling service, no PostgreSQL instance and no OIDC provider configuration. Free Render web services can sleep and free Render Postgres expires; neither should be represented as durable production hosting. The owner chose to develop locally and supply a server later.
- Configure customer-provided PostgreSQL, OIDC issuer/client, secrets, durable backups and restore procedures before deploying the account API.
- Real-network two-device/multi-instance fault and reconnect testing, Android/iOS device and screen-reader checks, and owner visual/gameplay acceptance remain open.
- For release: run exact-SHA dev Full Regression Census and Modular QA, then separately verify protected promotion, Pages deployment, hosted bytes/smoke and main regression.
