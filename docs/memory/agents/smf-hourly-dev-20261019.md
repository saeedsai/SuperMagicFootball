# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .171 KEEPER-OUTLET-MOVEMENT-READ-01: CPU keeper short throws, long clearances and low DRIBBLE rollouts now project active defenders along a bounded .12–.72 s flight and the existing receiver lead. A moving defender entering the corridor or predicted arrival pocket makes that outlet unsafe; safer teammates/open turf remain eligible.
- Focused Node tests cover closing/retreating defenders, receiver lead, short-vs-long flight, mirrored direction, inactive defenders, legacy velocity and fail-closed inputs. New real-engine Chromium acceptance checks both goals and desktop/simulated touch.
- .170 Modular QA #44970268998 passed; Full Regression Census #44970269093 passed preflight, preview, all four Node/four Chromium shards and QA-gated promotion. Main and dev converged at .170 before this candidate. Pages/main hosted-byte verification was not independently observed.
- .171 source, tests and release metadata are committed on existing dev; exact-head CI pending.
- **Release blocker:** a contents update omitted `branch: "dev"`, accidentally creating main-only test commit `3741d2ee3b5978435aee5abc41228e10d35dbc39`; it adds a .171 helper test that cannot pass against main's .170 source. This is not a promotion. Current dev `16ef6cb6b6c3a03e3a1d845aa6431cce47eafe83`, main `3741d2ee3b5978435aee5abc41228e10d35dbc39` (dev 26 ahead/1 behind). No more main writes or manual reconciliation; #87 must be resolved through an approved path.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual art approval or physical-device acceptance claimed.

## Evidence
- .170 main SHA: `f9ad7a165ba76623c91bc3f3f1b5b7989b127c95`; #87 remains unresolved, #48 and #86 remain open. Graphics issue #10 remains owner/graphics acceptance scope.
- Full unfiltered REST actions/runs listing is not exposed by the connected GitHub actions functions; known .170 run job lists were inspected directly. Do not represent PR-filtered lookup as the full list.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .171; fix only confirmed failures, then verify QA-gated promotion, Pages deployment, main Census and hosted-byte smoke separately. Continue an unblocked player-facing gameplay improvement.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
