# Candidate 0.12.81.49 — local validation (5 November 2026)

## Changes

- Existing procedural players now make two restrained, staggered pupil-only glances during standing idle. Eye whites, lids, brows and face geometry stay fixed; movement, actions, hurt/cry poses and reduced-flash disable the gaze. Rendering does not change player or ball simulation state.
- The Online API now holds a PostgreSQL session advisory lock for its lifetime. A second process fails before listening; loss of the lock connection closes matchmaking, WebSockets, listener and readiness. This protects the existing single-process queues/matches from split-brain service instances.
- Startup recovery runs only after acquiring the singleton lock and before opening the listener. In bounded batches, it replays fixtures only when the immutable result store already contains a valid final result; no-result fixtures become retryable with no score or reward.
- Online Ultimate Team lineup writes now serialize idempotency checks at account scope, matching the database's \`(account_id, idempotency_key)\` constraint and returning a deterministic conflict when the same key is reused for another team's lineup.

## Local validation

- Build and \`npm run test:node\`: **5,181,206 JavaScript characters / 5,304,218 HTML characters**, **2,253/2,253 Node tests passed**, followed by the Club26/FC27 executable (**32 clubs, 384 player slots; FC27 editorial 12**).
- Release/version and promotion contracts: **22/22 passed**.
- Focused gaze/blink/turn/shot renderer tests: **12/12**; Career and account-service suites: **24/24**; UT lineup/account API suites: **48/48**.
- \`python3 tests/characterart_idle_gaze_browser_qa.py\`: actual production renderer passed front and quarter-front samples; 114 and 96 changed eye pixels while open, neutral samples returned to zero difference, player/ball state remained unchanged, and there were no page errors. Contact sheet: [actual-renderer gaze samples](evidence/browser/player_idle_gaze_012849.png). This is automated visual evidence, not owner approval.
- \`git diff --check\` passed.

## PostgreSQL integration evidence

An ephemeral, local PostgreSQL 16 Docker container with no persistent volume ran the online schema setup and integration checks:

- Two API processes sharing one database: first process became healthy; the contender was refused before opening its listener; after graceful close, a new process acquired the lock and became healthy.
- Terminating the lock-owning PostgreSQL backend caused the API to close its listener and fail closed. A fresh service then reacquired the lock and returned healthy.
- Career recovery released an interrupted fixture with no durable result as scheduled, with no score/progression; a later fixture with an immutable final result advanced exactly once and remained idempotent.
- Concurrent cross-team UT lineup writes using the same account/key produced one committed lineup and one \`idempotency-conflict\`; the PostgreSQL ledger and lineup tables each contained exactly one row.

These checks validate local PostgreSQL 16 behavior only. They are not a run against the owner's future provider, credentials, production database, backups or network.

## Exact-head and external gates

Candidate .49 has not yet been committed or pushed. Exact-head Full Regression Census, Modular QA, protected promotion, Pages deployment, hosted-byte smoke and main regression remain pending. Candidate .48 was separately promoted and deployed; its exact-head Census/Modular QA, Pages and main Census passed as recorded in [candidate .48 validation](CANDIDATE_012848_VALIDATION_20261105.md).

The public API still needs the owner's future server, OIDC configuration, durable managed PostgreSQL, backups/restore and real-network two-client acceptance. Android/iOS and screen-reader acceptance plus owner visual/gameplay approval remain open. Offline play and local saves remain available.
