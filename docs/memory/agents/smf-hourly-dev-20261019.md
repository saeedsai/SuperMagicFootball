# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Prioritize real player-facing gameplay and existing-player animation/graphics; never substitute repeated test-only or documentation-only iterations for product work. Preserve four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.209 adds AI-GOALMOUTH-RECEIVER-ORIENTATION-01: among otherwise safe central goalmouth outlets, CPU selection gives a bounded preference to a receiver already facing goal. A genuine forward run overrides stale facing, and the sole safe outlet is never rejected. Pass safety, shot priority, ball physics and four actions remain unchanged.
- .208 exact-head Modular QA #45088943433 passed. Full Census #45088943437 passed preflight, preview, all four Node shards and Chromium shards 1–3; browser shard 0 failed only the READ! screenshot. The downloaded artifact proves both “with” and “without” images captured the existing Home menu, not the appended canvas, because the short locator IDs collided with existing DOM IDs. .209 changes to unique canvas IDs and asserts the screenshot targets are CANVAS elements; no production cue failure was established.
- Main remains .197 at `734090056af345d76e5d25079b2e2f8c1798ba65`. #87 protection, #86 Render drift, #48 physical-device acceptance, #10 existing-player graphics and #3 Android double tap remain open.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .209. Fix any confirmed failure, then allow only the existing QA-gated promotion. Verify Pages deployment, main Census and hosted-byte smoke independently.

## Next five product improvements
1. Improve responsive ball control, intelligent passing and fair tackle/interception decisions without adding controls.
2. Continue source-faithful existing-player eight-view Studio graphics after the graphics scope is available, with game-scale screenshot acceptance.
3. Improve goalkeeper dive, catch and second-ball decisions only where a reproducible gap remains.
4. Improve Player Studio live preview and directional customization.
5. Deepen Career/Cup progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or owner visual approval claims; no routine LAN/P2P work. #48 stays open; #87 remains unresolved.

## Evidence
- .208 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45088943433
- .208 Full Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45088943437
- Main .197 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988
- Main .197 Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045564160

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
