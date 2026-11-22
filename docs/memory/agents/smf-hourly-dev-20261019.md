# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Prioritize real player-facing gameplay, existing-player presentation and Career/Cup improvements. Preserve four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.205 MAGIC-TRICK-2D-PRIMARY-READ-01 is committed: primary named-trick and delayed Lightning counters now evaluate the defender's 2D heading (dx/dy, then velocity, then horizontal-facing fallback). Vertical/diagonal front reads work; rearward movement does not counter. Existing closing, range, skill, cost and counter windows remain.
- .204 READ! screenshot fixture now isolates the actual reader, moves the ball out of the cue region and freezes camera easing for desktop/touch captures.
- .205 first preflight: 2,770 tests, 2,767 passed, 3 failed because the service-worker first-line comment remained .204. Corrected in `cd9dd063`.
- .205 second preflight: 2,770 tests, 2,769 passed, one failure because the version policy heading did not contain exact `About-only 0.12.81.205`. Candidate wording corrected in this follow-up. New 2D Magic Trick/Lightning integration regression passed in both runs. Fresh exact-head QA pending; .205 is not certified.
- Main remains .197 on `734090056af345d76e5d25079b2e2f8c1798ba65`. Dev was `cd9dd063386bd09b2deeccf992ab2e33ced668bc` before this wording-only repair. #87 protection, #86 Render drift, #48 physical device acceptance and #3 Android double tap remain open.

## Next smallest action
Verify fresh exact-head Modular QA and four-Node/four-Chromium Census. Fix confirmed failures; only the existing QA-gated pipeline may promote a green exact dev head.

## Next five product improvements
1. Improve responsive ball control, tackling and intelligent support decisions without adding controls.
2. Continue source-faithful existing-player eight-view Studio graphics and game-scale acceptance.
3. Improve goalkeeper dive, catch and second-ball decisions where a reproducible gap remains.
4. Improve Player Studio live preview and directional customization.
5. Deepen Career/Cup season progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or owner visual approval claims; no routine LAN/P2P work. #48 stays open; #87 remains unresolved.

## Evidence
- .205 first Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45076274252
- .205 second Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45076500187
- .205 second Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45076500269
- .204 Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45070686820
- Main .197 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
