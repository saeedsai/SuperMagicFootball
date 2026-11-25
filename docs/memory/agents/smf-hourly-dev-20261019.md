# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.304 — AI-DRIBBLE-RESIDUAL-CLOSING-READ-01:** dribble-trick duel odds now receive actual residual defender movement in world units/second. A marker still closing after releasing input can read/counter the trick; stationary or retreating markers receive no closing bonus. No odds coefficients or player movement changed.
- Gameplay and focused Node/Chromium regressions are included in this candidate's dev commit; exact immutable SHA is the containing Git commit.

## Branches and release
- Parent dev head: `6983ea8959b9b55441293fed69a8346a0913070e` (.303 fixture/checkpoint correction).
- Main remains .302: `25a6f58e124fe174a5ccc53bbd29c8ae20ae77f1`.
- .303 Modular QA #45675586715 passed; Full Regression Census #45675586834 was still running when .304 work began. .304 is not promoted/deployed.

## Next smallest action
Run Modular QA and Full Regression Census on the exact .304 dev head. Fix confirmed failures without weakening gameplay behavior. Only a green exact head may advance through the existing QA-gated pipeline; then independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .303 Modular QA #45675586715 passed on parent dev SHA `6983ea8959b9b55441293fed69a8346a0913070e`.
- .303 Census #45675586834: preflight/preview and Node shards 2/3 passed; Node shards 0/1 and all four Chromium shards were running at the last observed check.
- .304 focused Node and Chromium regressions are added; exact-head CI results pending.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.