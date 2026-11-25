# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.303 — AI-DRIBBLE-TRICK-MULTI-DEFENDER-ESCAPE-LANE-01:** CPU dribble tricks compare both lateral exits against additional ready defenders' bounded 120 ms movement; a second defender closing the nearest-away route can redirect the trick. Active slides use remaining timed travel. The nearest defender still controls duel odds; human trick direction is unchanged.
- Gameplay commit: `2d8244b9f4f0bc51853cb735253cbd101a9a2dc0`. Release metadata correction: `73377e31cc86fa71a3b41a4caa704a9ac8df7116`.
- Exact-head QA #45675146060 initially found two issues: the new failure-path fixture let the nearest rival enter the existing 60-unit spill radius, and this checkpoint lacked the required Evidence heading. The mirrored fixture now keeps the nearest rival outside spill range; checkpoint evidence is restored. Fresh exact-head gates are pending.

## Branches and release
- dev source feature commit: `2d8244b9f4f0bc51853cb735253cbd101a9a2dc0`
- main remains .302: `25a6f58e124fe174a5ccc53bbd29c8ae20ae77f1`
- .302 passed exact-head dev Census, QA-gated promotion, Pages deployment, hosted smoke and independent main Census. .303 is not promoted/deployed.

## Next smallest action
Run Modular QA and Full Regression Census on the corrected .303 dev head. Fix confirmed failures without weakening gameplay behavior. Only a green exact head may advance through the existing QA-gated pipeline; then independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .302 main Full Regression Census #45665036033 passed all four Node and four Chromium shards; Pages deployment #45665023921 succeeded on exact main SHA `25a6f58e124fe174a5ccc53bbd29c8ae20ae77f1`.
- .303 initial Modular QA #45675146060: 2,909 passed, 2 failed. Both failures are addressed in the corrected fixture/checkpoint commit; final exact-head reruns remain pending.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
