# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver real player-facing gameplay, existing-player presentation and Career/Cup improvements while preserving the four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.205 MAGIC-TRICK-2D-PRIMARY-READ-01 is committed: primary named-trick and delayed Lightning counters now evaluate the defender's 2D heading (dx/dy, then velocity, then horizontal-facing fallback). Vertical/diagonal front reads work; rearward movement does not counter. Existing closing, range, skill, cost and counter windows remain.
- Also repaired the .204 READ! screenshot fixture by isolating the actual reader, moving the ball out of the cue region and freezing camera easing for desktop/touch captures.
- .205 first exact-head Node run: 2,770 tests, 2,767 passed, 3 failed solely because the service-worker header comment still said .204. The new real-engine Magic Trick/Lightning heading regression passed. The comment is corrected in the following test-only commit; .205 is not certified yet.
- .204 Modular QA #45070686767 passed 2,769/2,769. Census #45070686820 passed preflight, preview, all four Node shards and browser shards 0–2; browser shard 3 failed the simulated-touch READ! screenshot and a historical LAN browser 10-second Playwright wait. No LAN production change.
- Main remains .197 on SHA `734090056af345d76e5d25079b2e2f8c1798ba65`; dev .205 gameplay commit SHA `2f8558811bb3ef23d49d13df7b46142fb51cfc57` before the header-only repair. #87 protection, #86 Render drift, #48 physical device acceptance and #3 Android double tap remain open.

## Next smallest action
Verify the corrected exact-head Modular QA and four-Node/four-Chromium Census. Fix confirmed failures; only the existing QA-gated pipeline may promote a green exact dev head.

## Next five product improvements
1. Improve responsive ball control, tackling and intelligent support decisions without adding controls.
2. Continue source-faithful existing-player eight-view Studio graphics and game-scale acceptance.
3. Improve goalkeeper dive, catch and second-ball decisions where a reproducible gap remains.
4. Improve Player Studio live preview and directional customization.
5. Deepen Career/Cup season progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or owner visual approval claims; no routine LAN/P2P work. #48 stays open; #87 remains unresolved.

## Evidence
- .205 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45076274252
- .205 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45076274197
- .204 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45070686820
- Main .197 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
