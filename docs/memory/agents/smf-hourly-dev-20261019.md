# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.287 — KEEPER-HIGH-CROSS-CROSS-TRACK-TURN-READ-01:** CPU high-cross claim reach now discounts cross-track keeper momentum by a turn-response cost capped at 18 units. Aligned approach momentum retains its existing bonus, retreating momentum its existing penalty, and stationary reach is unchanged. Active attacker/teammate arrival priority, claim geometry and catch physics are preserved.
- Production change: src/modules/ai.js. Focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both goals, cross-track versus aligned momentum and the bounded cost ceiling.
- **0.12.81.286:** Modular QA #45560134671 passed on exact SHA 5ff5690bd4f0b6c2235c1e3808f0278e28268702. Full Regression Census #45560134679 passed preflight, preview, three Node shards and all four Chromium shards; Node shard 1 was still running at the last inspection.

## Next smallest action
Finish the exact .287 Modular QA and four-Node/four-Chromium Full Regression Census. Fix only confirmed failures; then verify QA-gated promotion, Pages deployment, independent main Census and hosted-byte smoke. Continue with another distinct gameplay or existing-player Studio improvement.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. Authenticated online hosting is not live without owner resources.

## Evidence
- .287 parent dev HEAD: 5ff5690bd4f0b6c2235c1e3808f0278e28268702; main HEAD at start: ae45e649c2d1c6d017b5bdf78c1d5899b2b41ad6.
- .286 Modular QA passed. Its exact-head Census had preflight/preview and all completed Node/Chromium shards green; one Node shard remained in progress at last inspection.
- .285 exact-head dev Census, Modular QA and Pages passed; .285 main Census had a historical LAN browser timeout. #87 remains open; branch protection is not confirmed by this run's restricted protection endpoint. #48 remains open; no physical two-phone certification is claimed.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.