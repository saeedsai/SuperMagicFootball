# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Prioritize player-facing gameplay and existing-player animation/graphics. Never substitute repeated audits, tests-only work or documentation-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- 0.12.81.211 adds KEEPER-AERIAL-CROSS-CONTEST-01. A CPU goalkeeper now considers an already-airborne opponent only when a real jump pose is active and the opponent's projected vertical body envelope overlaps the descending high cross at the same 0.12-second horizon as the horizontal arrival estimate. Grounded challenger pressure and existing punch/catch physics are unchanged.
- .210 Modular QA #45098663459 passed 2,780/2,780. Full Census #45098663486 failed browser shard 0: READ! screenshot fixture removed the live UI DOM while requestAnimationFrame continued, causing a null classList error; .211 keeps the DOM mounted and hides non-canvas children. The same shard also had an independent LAN guest-movement timeout; no LAN source changed and a fresh exact-head run must determine whether it is transient.
- Main remains .197 at `734090056af345d76e5d25079b2e2f8c1798ba65`. #87 protection, #86 Render drift, #48 physical-device acceptance, #10 existing-player graphics and #3 Android double tap remain open.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .211. Inspect READ! desktop/touch screenshots and airborne-cross desktop/touch results; investigate any repeat LAN timeout from its exact artifact. Only a green exact dev head may enter the QA-gated promotion pipeline.

## Next five product improvements
1. Improve responsive first touch, intelligent passing and fair interception/tackle decisions without adding controls.
2. Continue source-faithful existing-player eight-view Studio graphics after the graphics scope is available, with game-scale screenshot acceptance.
3. Improve goalkeeper dive/catch reactions, cross contests and second-ball recovery where reproducible gaps remain.
4. Improve Player Studio live preview and directional customization.
5. Deepen Career/Cup progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or owner visual approval claims; no routine LAN/P2P work. #48 stays open; #87 remains unresolved.

## Evidence
- .210 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45098663459
- .210 Full Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45098663486
- Main .197 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988
- Main .197 Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045564160

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
