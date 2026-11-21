# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .136 AI-SUPPORT-RUN-INTERCEPT-01: support-run PASS preference now reuses the existing bounded, time-aware directed-pass lane predictor, yielding when a grounded active defender is projected to close the corridor; defenders moving away or with invalid velocity remain neutral. Unsafe preference falls back to normal AI receiver ranking. Pass physics/four actions/saves unchanged.
- .135 AI-SUPPORT-RUN-PASS-01: exact-head Full Regression Census passed preflight, preview smoke, all four Node and all four Chromium shards; Modular QA passed; promote-dev-to-main job passed. `main` and `dev` both equal `dc2c4a517cf1cb11eb823ea050b3358e0591b9af`. Pages deployment and hosted-byte smoke not independently verified; .134 remains latest Pages-verified release.
- Main protection #87, Render drift #86 and physical two-phone acceptance #48 remain open.

## Next smallest action
Run .136 exact-head Modular QA and four-Node/four-Chromium Census; fix confirmed failures, then allow only the existing QA-gated promotion and independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
Three focused Node regressions cover a grounded defender moving into the support-run lane, a defender moving away, and invalid velocity neutrality; existing tests cover static blockers, downed/high/recovering defenders, lane arrival, fallback intent and driveAI wiring. Local GitHub DNS resolution failed, so no local Node/Chromium run is claimed.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.