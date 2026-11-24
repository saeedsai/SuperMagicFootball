# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.268 — AI-THIRD-MAN-COVERAGE-ARRIVAL-READ-01:** primary/support defenders now count as covering a central runner only when their bounded 120 ms projected positions still close on the runner's projected lane. A nearby marker moving away no longer suppresses an available third-man mark; a marker closing into the lane still prevents redundant cover.
- Implementation in `src/modules/ai.js`; mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover both defending directions and moving-away versus closing support.
- Release metadata synchronized: About-only notes, package, README heading/banner, version policy, service-worker cache, master backlog and this checkpoint. Exact-head Modular QA/Census pending.

## Next smallest action
Verify .268 exact-head Modular QA and four-Node/four-Chromium Full Regression Census. Fix confirmed failures only, then continue the next unblocked player-facing gameplay increment; promote only a fully green exact head through the existing QA-gated pipeline and independently verify Pages, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- Previous .267 Modular QA #45419513409 passed source/data validation. Its exact-head Full Regression Census #45419513336 was still running at the previous observation.
- Main .266 SHA `b0b5641b88b56b7d8915e5944a2edc2455e37c53`: Pages deployment #45414997006 and independent main Census #45415010070 passed, including hosted-pages smoke and all four Node/four Chromium shards.
- REST reports `dev.protected=false` and `main.protected=false`; #87 remains open. No protection bypass or manual promotion.
- Local GitHub DNS is unavailable; connected GitHub source/API is used. Local Node/Chromium execution is not claimed; exact-head Actions are the verification gate.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
