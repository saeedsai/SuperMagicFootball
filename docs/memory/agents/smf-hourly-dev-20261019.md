# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .137 PLAYER-MOTION-PASS-PREDICTION-01: directed receiver ranking, moving-defender interception and support-run PASS aim now use the engine's actual moveVX/moveVY world velocities with bounded lookahead/caps; legacy vx/vy fallback remains for non-engine callers.
- .137 AI-SUPPORT-RUN-MOTION-READ-01: support-run lane scoring projects active defenders through a bounded runner-arrival window, avoiding a diagonal lane they are sprinting into while allowing lanes they leave.
- .136 CI blocker: Full Regression Census and Modular QA each failed 1/2,568 Node tests at tests/directed_pass_lane.test.cjs:298 because it asserted the now-shared passingLanePressure helper remained private. Updated the contract to verify the helper and its grounded/airborne behavior. Live players use moveVX/moveVY; .136 tests used synthetic vx/vy.
- Base dev head before .137: e2c47179f07b1463a5a2af8c516565480501c3c9. Main: dc2c4a517cf1cb11eb823ea050b3358e0591b9af (dev 13 ahead, 0 behind before this candidate).

## Next smallest action
Run exact-head .137 Modular QA and Full Regression Census (four Node + four Chromium shards); repair confirmed failures, then use only the existing QA-gated promotion and independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
.137 adds actual-player movement regressions for directed receiver lead, lateral drift, moving-defender interception, support-run pass lead caps, and defender-aware diagonal selection. No local Node/Chromium execution is claimed; connected GitHub Actions must provide exact-head evidence.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.