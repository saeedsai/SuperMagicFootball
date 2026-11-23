# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Prioritize real player-facing gameplay and existing-player animation/graphics; never substitute repeated test-only or documentation-only iterations. Preserve four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.210 adds AI-CUTBACK-RECEIVER-ORIENTATION-01: CPU cutback selection gives a bounded 22-point preference to an otherwise equivalent receiver already facing the attacking goal. Actual forward momentum above 110 units overrides stale facing; a sole safe outlet remains eligible. Lane/collection safety, low PASS trajectory and shot priority remain unchanged.
- .209 Modular QA #45093668108 passed 2,779/2,779. Full Census #45093668112 failed only browser shard 0. Downloaded artifact #14782229108 shows both READ! screenshots captured the Home menu overlay instead of the real-renderer canvas: the appended canvas was behind the app UI. .210 isolates one canvas as the sole viewport child and checks its viewport bounds before screenshot comparison. No production READ! rendering defect was established.
- Main remains .197 at `734090056af345d76e5d25079b2e2f8c1798ba65`. #87 protection, #86 Render drift, #48 physical-device acceptance, #10 existing-player graphics and #3 Android double tap remain open.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .210. Inspect the isolated desktop and simulated-touch READ! artifacts, repair any confirmed failure, then allow only the existing QA-gated promotion. Verify Pages deployment, main Census and hosted-byte smoke independently.

## Next five product improvements
1. Improve responsive ball control, intelligent passing and fair tackle/interception decisions without adding controls.
2. Continue source-faithful existing-player eight-view Studio graphics after the graphics scope is available, with game-scale screenshot acceptance.
3. Improve goalkeeper dive, catch and second-ball decisions where a reproducible gap remains.
4. Improve Player Studio live preview and directional customization.
5. Deepen Career/Cup progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or owner visual approval claims; no routine LAN/P2P work. #48 stays open; #87 remains unresolved.

## Evidence
- .209 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45093668108
- .209 Full Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45093668112
- Main .197 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988
- Main .197 Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045564160

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
