# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Prioritize real player-facing gameplay and existing-player animation/graphics; never substitute repeated test-only or documentation-only iterations for product work. Preserve four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.206 adds RECEIVE-BALL-GAZE-01: during the existing receive pose, pupils follow the incoming unowned ball's projected x/y (including height) in local facing coordinates, bounded to 230 field units. It is render-only and does not alter player/ball state.
- 0.12.81.206 adds READ-CUE-SCREEN-SCALE-01: the existing Magic Trick READ! label and outline compensate for logical viewport scale and cancel horizontal mirroring, so the same cue remains readable from either facing at mobile and desktop game scale.
- The .205 Full Regression Census #45076650731 had one confirmed browser-fixture failure: 67/68 scripts passed, but the READ! screenshot compared the home menu rather than a live match. Downloaded desktop images differed due to menu animation; simulated-touch images were identical. No production cue defect was established. .206 captures the actual production field/player renderer and includes screen-scale acceptance.
- The .206 Node helper tests cover front/rear, both facing directions, high/low ball, distance, invalid, owned and preview states. Production-renderer Chromium acceptance checks eye pixels and state immutability on desktop and simulated-touch viewports.
- Main remains .197 at `734090056af345d76e5d25079b2e2f8c1798ba65`; .206 remains a dev candidate until exact-head Modular QA and all four Node/four Chromium Census shards pass. #87 protection, #86 Render drift, #48 physical device acceptance and #3 Android double tap remain open.

## Next smallest action
Run focused Node/Chromium and exact-head Modular QA plus four-Node/four-Chromium Census. Fix confirmed failures; only the existing QA-gated pipeline may promote a green exact dev head. Verify Pages deployment, main Census and hosted-byte smoke independently.

## Next five product improvements
1. Improve responsive ball control, intelligent passing and fair tackle/interception decisions without adding controls.
2. Continue source-faithful existing-player eight-view Studio graphics and game-scale acceptance.
3. Improve goalkeeper dive, catch and second-ball decisions only where a reproducible gap remains.
4. Improve Player Studio live preview and directional customization.
5. Deepen Career/Cup progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or owner visual approval claims; no routine LAN/P2P work. #48 stays open; #87 remains unresolved.

## Evidence
- .205 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45076650731
- .205 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45076650861
- Main .197 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
