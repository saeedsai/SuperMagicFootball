# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.293 — AI-DEFENSIVE-PRESS-CROSS-TRACK-TURN-READ-01:** CPU press/support scoring includes a bounded 120 ms Agility-scaled cross-track turn reserve (maximum 12 score units).
- First .293 Modular QA #45603566184 and Full Regression Census #45603565956 failed in Node preflight: the first edit replaced only the defensivePressers signature, leaving the old body after the new function and causing SyntaxError at defensiveCounterpressTrapTarget. The fix now replaces the complete function block; the new feature has not yet passed focused runtime tests.
- .292 failed-job-only Census retry #45592512918 passed; QA-gated promotion advanced main to SHA `faa2fda91f6c34e49c27adf1d9f5c5e4a5f7452b`. Main .292 Census #45602464413 passed preflight, hosted smoke and preview; three Node shards and two browser shards passed, with Node shard 1 and browser shards 0/3 still running at last inspection. .292 Pages deployment not yet independently confirmed.
- Current .293 fix commit will trigger fresh exact-head gates; only a fully green head may promote.

## Next action
Inspect the new exact-head Node and Chromium results, repair confirmed code/test failures, then verify QA-gated main promotion, main Census, Pages deployment and hosted bytes independently.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
