# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .135 AI-SUPPORT-RUN-PASS-01: AI carriers prefer an already-entered forward support-run receiver only when the ground-pass corridor and arrival point are clear; otherwise existing AI receiver ranking remains. Pass physics, four actions and saves unchanged.
- .134 AI-SUPPORT-RUN-LANE-01 passed exact-head dev Census (4 Node + 4 Chromium shards) and Modular QA; QA-gated promotion, Pages deployment and hosted smoke passed. Same-SHA main workflow-dispatch Census retry had one LAN auto browser movement-threshold failure; the push Census passed all shards.
- Current pre-edit dev/main heads both .134: `e336a11428e46fec79e910b7d085cec382fdc716`. Main protection #87, Render drift #86 and physical two-phone acceptance #48 remain open.

## Next smallest action
Run exact-head .135 Census and Modular QA; fix confirmed failures, then allow only the existing QA-gated promotion and independently verify main Census, Pages and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
Five focused Node cases cover clear support selection, corridor/arrival blockers, downed/high/stunned defender exclusion, not-yet-arrived fallback, opt-in preferred-target selection and driveAI wiring. First Modular QA run exposed an uninitialized GameEngine fixture; explicit init added in follow-up test commit. Exact-head rerun pending.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
