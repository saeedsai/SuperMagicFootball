# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.274 — AI-FIRST-TOUCH-SLIDE-SWEEP-AVOIDANCE-01:** CPU first-touch escape evaluates active slide trajectories as swept lanes and favors the diagonal with less immediate exposure. Retreating, expired, invalid and out-of-reach slides do not create false threats.
- Production change in src/modules/ai.js; mirrored helper, actual-engine Node and desktop/simulated-touch Chromium regressions cover both teams, possession retention and no premature release.
- .273 passed exact-head Modular QA #45468630881 and dev Census #45468630743, was promoted through the existing pipeline, and Pages deployment #45470529269 succeeded. Independent main Census #45470542080 failed only the asynchronous marketplace loader assertion in browser shard 3; a wait-aware test correction is included in .274.

## Next smallest action
Run exact-head Modular QA and the four-Node/four-Chromium Full Regression Census for .274. Repair confirmed failures, then allow only the existing QA-gated promotion. Independently verify Pages, main Census and hosted bytes before claiming release.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- Before .274, dev and main both pointed to .273 SHA f1fc56e829d4d05ee5dffe508550e9f479e3de86.
- .273 Modular QA #45468630881 passed; dev Census #45468630743 passed preflight, preview, all four Node and all four Chromium shards; QA-gated promotion succeeded.
- .273 Pages deployment #45470529269 succeeded. Independent main Census #45470542080 passed hosted smoke, preflight, preview, four Node shards and browser shards 0–2; browser shard 3 failed only online_account_ui_browser_qa.py delayed marketplace loading assertion, now wait-aware.
- REST reports main.protected=false and dev.protected=false; repository rulesets are empty and #87 remains open. No manual promotion or protection bypass.
- Physical two-phone #48, Render drift #86 and authenticated online hosting remain unverified/open.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
