# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.276 — AI-MAGIC-TRICK-LIGHTNING-MOMENTUM-READ-01:** delayed Lightning resolution now recognizes residual 2D movement toward the marked carrier after directional input releases. Current dx/dy remains authoritative; moveVX/moveVY is used only when input is neutral. Retreating movement and stationary face-only defenders still fail the counter.
- Production change in `src/modules/engine.js`; mirrored actual-GameEngine Node and desktop/simulated-touch Chromium regressions cover both teams, approach, retreat and stationary facing.
- .275 exact-head Modular QA #45484164516 passed; Full Regression Census #45484164535 passed preflight, preview, all four Node and all four Chromium shards, and QA-gated promotion. Pages deployment #45486084208 succeeded. Independent main Census #45486092597 passed preflight, preview, hosted-pages smoke, Node shards 0/2/3 and Chromium shards 0/2/3; Node shard 1 and Chromium shard 1 were still running at latest inspection.
- .276 exact-head Modular QA and Full Regression Census are pending.

## Next smallest action
Complete .276 exact-head Modular QA and four-Node/four-Chromium Census; repair confirmed failures, then allow only the existing QA-gated promotion. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; no device or hosting acceptance claimed.

## Evidence
- Before .276, dev and main both pointed to `7dced88059b85d4b74ed0b996733c10632bed6af`; .275 is the currently Pages-deployed candidate.
- GitHub branch metadata reports `main.protected=false`; repository rulesets are empty and #87 remains open.
- Physical two-phone #48, Render drift #86 and authenticated online hosting remain unverified/open.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
