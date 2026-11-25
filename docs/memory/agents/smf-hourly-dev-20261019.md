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
- .303 Modular QA #45675586715 passed; Census #45675586834 failed only browser shard 2 because the .303 mirrored browser fixture omitted its local dir declaration (71 browser scripts passed, one harness error; all Node shards passed). .304 repairs that fixture. The first .304 Modular QA #45678021327 and Census preflight #45678021288 then exposed one stale source-contract assertion about axis-selected movement; the assertion is corrected. Fresh exact-head runs pending.

## Next smallest action
Run Modular QA and Full Regression Census on the exact .304 dev head. Fix confirmed failures without weakening gameplay behavior. Only a green exact head may advance through the existing QA-gated pipeline; then independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .303 Modular QA #45675586715 passed on parent dev SHA `6983ea8959b9b55441293fed69a8346a0913070e`.
- .303 Census #45675586834: all four Node shards and 71/72 browser scripts passed; the sole failure was ReferenceError: dir is not defined in the newly extended dribble-trick browser fixture. The .304 fixture now declares mirrored direction inside the team loop.
- .304 focused Node and Chromium regressions are added; the browser team-direction fixture and source-contract assertion are corrected. Exact-head QA then exposed a team-1 integration fixture that had not mirrored marker Y; both Node and Chromium cases now use the existing mirrored geometry. Production code is unchanged by these fixture repairs; fresh exact-head CI pending.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.