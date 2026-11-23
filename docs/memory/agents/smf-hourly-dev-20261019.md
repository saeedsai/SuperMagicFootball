# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Prioritize real player-facing gameplay and existing-player animation/graphics; never substitute repeated test-only or documentation-only iterations for product work. Preserve four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.208 fixes the READ! counter cue: the existing .48-second ring/label now renders after character-local transforms, anchored to the actual player position and compensated only for viewport scale. This addresses the confirmed simulated-touch screenshot failure without changing the timer or reduced-flash behavior.
- 0.12.81.208 adds AI-TACKLE-MOMENTUM-HEADING-01: CPU slide selection prefers actual 2D movement velocity over stale dx/dy input, then uses input/facing fallbacks when momentum is negligible. Retreating momentum cannot select a forward slide; genuine diagonal forward run-ups remain eligible.
- .207 Modular QA #45085155336 passed 2,776/2,776. Census #45085155258 passed preflight, preview, four Node shards and Chromium shards 1–3; browser shard 0 failed the simulated-touch READ! screenshot with no changed pixels. .207 is not certified.
- .208 adds focused mirrored AI helper regressions, a world-space renderer contract and retains the actual-renderer desktop/simulated-touch screenshot test. Exact-head gates pending.
- Main remains .197 at `734090056af345d76e5d25079b2e2f8c1798ba65`; #87 protection, #86 Render drift, #48 physical-device acceptance and #3 Android double tap remain open.

## Next smallest action
Run exact-head Modular QA and the full four-Node/four-Chromium Census. Repair confirmed failures, then allow only the existing QA-gated pipeline to promote. Verify Pages deployment, main Census and hosted-byte smoke independently.

## Next five product improvements
1. Improve responsive ball control, intelligent passing and fair tackle/interception decisions without adding controls.
2. Continue source-faithful existing-player eight-view Studio graphics after the graphics scope is available, with game-scale screenshot acceptance.
3. Improve goalkeeper dive, catch and second-ball decisions only where a reproducible gap remains.
4. Improve Player Studio live preview and directional customization.
5. Deepen Career/Cup progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or owner visual approval claims; no routine LAN/P2P work. #48 stays open; #87 remains unresolved.

## Evidence
- .207 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45085155336
- .207 Full Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45085155258
- Main .197 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
