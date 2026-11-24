# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.275 — AI-FIRST-TOUCH-OUTLET-SLIDE-SWEEP-READ-01:** pressured CPU first-touch outlet selection checks live slide direction and remaining sweep against the timed pass path and receiver pocket. It selects a clear alternate teammate or retains possession if every outlet is threatened.
- Production change in src/modules/ai.js; mirrored helper, actual-engine Node and desktop/simulated-touch Chromium regressions cover both teams, alternate selection and safe fallback.
- .274 Modular QA #45480378625 passed. Full Regression Census #45480378471 passed preflight, preview, all four Node shards and three Chromium shards; browser shard 3 failed only the external Render/PAGES hosted test with a 45-second wait_for_function timeout. Failed-job-only retry requested; no gameplay failure identified.
- .275 first Modular QA #45483684178 and Census #45483684174 exposed one Node fixture-only failure: the expired-slide fixture left an upright defender in the preferred outlet pocket, so ordinary proximity correctly selected the alternate. The fixture now marks that expired slider down; no production gameplay failure was observed. Rerun exact-head gates after this correction.
- .273 passed exact-head QA/Census and Pages deployment #45470529269 succeeded; main remains at the verified .273 SHA pending independent .274 promotion.

## Next smallest action
Complete .275 exact-head Modular QA and four-Node/four-Chromium Census; fix confirmed failures, then allow only the existing QA-gated promotion. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; no device or hosting acceptance claimed.

## Evidence
- Before .275, dev SHA was 6dc78996b7bae4bd91dbc267fd736cd7788729f2; main SHA was f1fc56e829d4d05ee5dffe508550e9f479e3de86.
- GitHub REST reports main.protected=false and dev.protected=false; repository rulesets are empty and #87 remains open.
- Physical two-phone #48, Render drift #86 and authenticated online hosting remain unverified/open.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
