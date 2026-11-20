# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-20

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .134 AI-SUPPORT-RUN-LANE-01: one eligible AI teammate makes a bounded forward diagonal run into the less-defended lateral lane when a teammate carries; other support players keep their width positions. Four actions, saves and roster data unchanged.
- .133 AI-AVAILABLE-PRESSER-01 passed exact-head dev Census and Modular QA, was promoted through the QA-gated pipeline, and Pages deployment passed. The separate main Census exposed one async browser assertion race in online Ultimate Team save; .134 waits for explicit save completion before checking request count.
- Pre-commit dev/main heads both .133: `7ccfc1c5e778c67c81e72bcba08107f13c9ebac0`. Main protection #87, Render drift #86 and physical two-phone acceptance #48 remain open.

## Next smallest action
Run exact-head .134 Census (four Node and four Chromium shards) and Modular QA; fix confirmed failures, then allow the existing QA-gated promotion and independently verify main Census, Pages and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN work or other agents' private checkpoints.

## Evidence
Production AI support-run helper is wired into `driveAI`; four focused Node regressions cover mirroring, pressure-aware lane choice, unavailable-player exclusion, teammate crowding and field bounds. Exact-head .134 workflows have not yet run.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
