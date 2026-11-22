# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Prioritize real player-facing gameplay and existing-player animation/graphics; never substitute repeated test-only or documentation-only iterations for product work. Preserve four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.207 adds RECEIVE-BALL-GAZE-TRAJECTORY-01: during the existing receive pose, pupils anticipate an unowned incoming ball with a bounded 100 ms/26-unit velocity projection, including vertical travel, and use local-facing horizontal coordinates. This fixes left-facing gaze and remains render-only.
- 0.12.81.207 adds AI-SHOOT-SLIDE-APPROACH-ALIGN-01: CPU defenders select the existing SHOOT slide only when their 2D movement heading (or stationary-facing fallback) enters the same forward arc used by tackle contact. Retreating and side-on run-ups keep the shorter PASS poke; slide reach, odds and speed are unchanged.
- .206 exact-head Modular QA #45083305918 and Census #45083305960 preflight exposed two Node assertions: left-facing receive gaze omitted view.side, and the READ! source regex did not accept the nested logical-scale expression. No live READ! rendering defect was established; .207 fixes both.
- .207 adds mirrored AI helper and receive-gaze Node regressions plus actual-renderer desktop/simulated-touch gaze acceptance. Exact-head Modular QA and four-Node/four-Chromium Census are required before promotion.
- Main remains .197 at `734090056af345d76e5d25079b2e2f8c1798ba65`; #87 main protection, #86 Render drift, #48 physical-device acceptance and #3 Android double tap remain open.

## Next smallest action
Run focused Node/Chromium, exact-head Modular QA and the complete Full Regression Census. Repair confirmed failures, then allow only the existing QA-gated pipeline to promote. Verify Pages deployment, main Census and hosted-byte smoke independently.

## Next five product improvements
1. Improve responsive ball control, intelligent passing and fair tackle/interception decisions without adding controls.
2. Continue source-faithful existing-player eight-view Studio graphics and game-scale acceptance.
3. Improve goalkeeper dive, catch and second-ball decisions only where a reproducible gap remains.
4. Improve Player Studio live preview and directional customization.
5. Deepen Career/Cup progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or owner visual approval claims; no routine LAN/P2P work. #48 stays open; #87 remains unresolved.

## Evidence
- .206 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45083305960
- .206 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45083305918
- Main .197 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
