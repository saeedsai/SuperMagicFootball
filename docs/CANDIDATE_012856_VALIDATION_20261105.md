# Candidate 0.12.81.56 validation

**Status: promoted to `main` and deployed to Pages for SHA `816fbef65f737c283ecf6dd6d98aef9ba84eaddf`; dev exact-head gates, hosted smoke, and main Census passed.** This increment makes authenticated Online PVP matches resumable after a graceful API service restart while retaining interruption for unclean crashes, invalid state, old schema/builds, or missing checkpoints.

## Changes

- The authoritative engine exports a bounded schema-1 JSON checkpoint with current engine build, canonical team and roster IDs, immutable engine configuration, configuration digest, tick, seeded RNG state, held-button edges/current input and allowlisted `GameEngine` own-state. Player/roster references and Sets use explicit encodings. Event telemetry and callbacks are omitted and rebuilt.
- Restore is allowed only on a fresh, unstepped engine with exact configuration, build and schema. The decoder validates the complete envelope and checksum into detached state before mutating the new engine. The checksum detects corruption; it is not authentication.
- PostgreSQL stores a maximum 256 KiB checkpoint bound to the active lifecycle participant/team assignment. Tick writes are monotonic, duplicate ticks idempotent, and rows expire after five minutes. Corrupt/expired rows are removed so one stale checkpoint cannot prevent startup.
- Live 30 Hz ticks do not write to PostgreSQL. The service first stops match timers during graceful shutdown, captures one final active PVP state, and waits for its durable write before closing the pool. Career CPU fixtures remain on their existing reservation recovery path.
- Startup restores only checkpoints marked eligible by graceful handoff. It checks durable final results first, restores the simulation and both disconnected authenticated seats, reconciles missing/unsafe no-result rows as interrupted, then consumes the one-use checkpoint before accepting resume tickets. Final result and checkpoint deletion share the lifecycle transaction.
- A crash-time checkpoint is never eligible for resume. If the service dies without graceful handoff, the no-result match is interrupted instead of rewinding player inputs. A hard crash does not resume the active simulation.

## Validation

- Focused engine, session, matchmaking, lifecycle, checkpoint-store, runtime and service suite: **81/81 passed** with `node --test tests/online-matchmaking-checkpoint.test.cjs tests/online-matchmaking.test.cjs tests/online-account-service.test.cjs tests/online-account-runtime.test.cjs tests/online-match-lifecycle-store.test.cjs tests/online-match-checkpoint-store.test.cjs tests/online-match-session.test.cjs tests/online-game-engine.test.cjs tests/online_game_engine_checkpoint.test.cjs`.
- Engine-only continuous-vs-restored replay test covers RNG, held-button edges and gameplay-state convergence; 40,321-byte peak observed in a 1,200-tick career-AI test run, under the 256 KiB cap.
- Store tests cover lifecycle binding, monotonic ticks, transaction rollback, checksum/byte corruption, expiration, bounded listing and cleanup.
- Service and matchmaking tests cover assignment mismatch, authenticated same-match resume, stale/crash checkpoint rejection, result precedence, timer-stop graceful persistence, transaction ordering and startup fail-closed behavior.
- `npm run test:node` passed: build (**5,223,137 JS / 5,346,332 HTML characters**), Node **2,309/2,309**, and Club26/FC27 parity check. The release/version contract passed **16/16** after the version and cache metadata update. `git diff --check` passed.
- An isolated local PostgreSQL 16 container passed runtime migrations and idempotent re-run, active-lifecycle binding, checkpoint write/read/list, durable-result reconciliation and stale-checkpoint deletion. An isolated local PostgreSQL 16 service close/restart harness with the real WebSocket transport and two loopback clients persisted and restored an active match at the exact tick, then reattached both seats using one-use resume tickets. Ticket issuance was called inside the service; OIDC, separate-network clients, hosted service and physical devices were not exercised. No hosted database/API, OS SIGTERM/hard-kill drill, load test, two-network client pair or device acceptance has run.

## Remaining acceptance

- Dev Full Regression Census `42041381910` and Modular QA `42041381928` passed for the exact SHA; protected promotion placed that same SHA on `main`.
- Pages deployment `42042745653`, hosted smoke and main Full Regression Census `42042746868` passed for that exact SHA.
- Add the checkpoint schema through the existing database migration path on the owner-provided server. Test real SIGTERM handoff/restore against PostgreSQL, followed by a hard-kill test that must mark no-result matches interrupted.
- Test two authenticated clients reconnecting to one restored match over separate networks. Verify backup/restore, database failure, bounded storage and graceful timeout behavior.
- The authenticated API is still not deployed; this candidate does not make public Online PVP/Career/Ultimate Team available.
