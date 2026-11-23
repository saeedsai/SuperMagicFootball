# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Prioritize real player-facing gameplay and existing-player animation/graphics; never substitute repeated test-only or documentation-only iterations for product work. Preserve four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.208 fixes the READ! counter cue: the existing .48-second ring/label now renders after character-local transforms, anchored to the actual player position and compensated only for viewport scale. This addresses the confirmed simulated-touch screenshot failure without changing the timer or reduced-flash behavior.
- 0.12.81.208 improves AI slide selection: the existing input/facing forward arc must agree with actual 2D movement momentum. Retreating momentum or side-on input cannot trigger a forward slide; diagonal forward run-ups remain eligible. The existing GameEngine tackle contact arc, odds, reach and speed are unchanged.
- .207 Modular QA #45085155336 passed 2,776/2,776; .207 Census failed browser shard 0 on simulated-touch READ! screenshot. .208 initial preflight exposed a source-contract regex that omitted the production call semicolon; commit 9993a5c6f87e331024d9c5a66310d023fb0a25af repairs the assertion. Modular QA #45088262048 passed on that head; Full Census #45088262139 passed preflight, preview and Node shards 2/3; remaining Node and Chromium shards were still running at checkpoint update.
- Main remains .197 at `734090056af345d76e5d25079b2e2f8c1798ba65`; #87 protection, #86 Render drift, #48 physical-device acceptance and #3 Android double tap remain open.

## Next smallest action
Finish exact-head Full Regression Census #45088262139. Repair any confirmed failure, then allow only the existing QA-gated pipeline to promote. Verify Pages deployment, main Census and hosted-byte smoke independently.

## Next five product improvements
1. Improve responsive ball control, intelligent passing and fair tackle/interception decisions without adding controls.
2. Continue source-faithful existing-player eight-view Studio graphics after the graphics scope is available, with game-scale screenshot acceptance.
3. Improve goalkeeper dive, catch and second-ball decisions only where a reproducible gap remains.
4. Improve Player Studio live preview and directional customization.
5. Deepen Career/Cup progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or owner visual approval claims; no routine LAN/P2P work. #48 stays open; #87 remains unresolved.

## Evidence
- .208 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45088262048
- .208 Full Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45088262139
- .207 Full Census diagnosis: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45085155258
- Main .197 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
