# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.292 — AI-MAGIC-TRICK-ACTIVE-APPROACH-READ-01:** direct named Magic Trick reads now require an active grounded defender and at least 0.22 directional alignment toward the carrier. Unavailable/recovering players and grazing lateral movement no longer create false direct counters; real input or residual-momentum approaches still count.
- Production: `src/modules/engine.js`; focused Node and actual-engine desktop/simulated-touch Chromium regressions extend `magic_trick_secondary_screen_read`.
- .291 was promoted to main/dev on exact SHA `c99e5a0a34ebced3faeeb7eef323ab22b929294c`; exact-head Modular QA and four-Node/four-Chromium Census passed. Pages deployment and independent main Census also passed, including hosted-pages smoke.
- .292 is committed on existing dev; exact-head Modular QA and Full Regression Census are pending.

## Next smallest action
Observe .292 exact-head Node and Chromium gates. Repair only confirmed failures, then allow a green exact head through the existing QA-gated promotion pipeline; verify main Census, Pages deployment and hosted bytes independently. Continue with a new player-facing gameplay increment after the gates.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .291 Modular QA #45583760166 and dev Census #45583760047 passed on the exact promoted SHA.
- .291 Pages deployment #45585445113 and independent main Census #45585459338 passed; hosted-pages smoke passed.
- GitHub REST reports dev and main currently unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
