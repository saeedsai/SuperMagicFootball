# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-20

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .133 AI-AVAILABLE-PRESSER-01: defensive AI no longer assigns primary press or cover to a teammate already stunned, knocked down/getting up, or committed to an active slide; the next available defender takes the pursuit.
- .132 KEEPER-SAFE-PARRY-LANE-01 passed exact-head dev Census, Modular QA, QA-gated promotion, main Census, Pages deployment and hosted-pages smoke. Both dev and main now point to the promoted .132 head.
- Main protection #87, Render drift #86 and physical two-phone acceptance #48 remain open. Breath .66–.68 is complete.

## Next smallest action
Run exact-head .133 Full Regression Census and Modular QA; inspect all four Node and four Chromium shards, fix confirmed failures, then continue the next bounded gameplay improvement.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN work or other agents' private checkpoints.

## Evidence
.133 production AI availability filter and three focused Node regressions are committed on dev. .132 dev/main Census, QA-gated promotion, Pages and hosted smoke passed. .133 exact-head QA and hosted release remain pending.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
