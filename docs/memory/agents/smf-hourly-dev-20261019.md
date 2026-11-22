# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay, presentation and Career/Cup improvements while preserving four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.199 AI-FIRST-TOUCH-MAGIC-TRICK-SCREEN-READ-01: during the short pressured first-touch read window, a second CPU defender visibly screening the carrier's forward lane and facing the carrier can read a Magic Trick even if the nearest marker is turned away or stationary. One bounded defender-skill penalty; ordinary trick reads still require an active nearby closer/facing defender. Uses public movement/position/facing only; no private AI target reads, automatic tackle or extra action.
- .198 Modular QA #45047592907 passed 2,759/2,759; Census #45047592941 failed one Chromium test because the keeper browser fixture captured post-catch return velocity in its earlier claim-approach field. .199 records claim and return velocities separately; no production keeper failure was established. .198 is not certified.
- .197 is Pages-deployed main on SHA `734090056af345d76e5d25079b2e2f8c1798ba65`; dev Census #45044723094 and Pages #45045555988 passed. Independent main Census #45045564160 passed all eight shards and hosted smoke on retry attempt 2.

## Next smallest action
Verify .199 exact-head Modular QA and all four Node/four Chromium Census shards; fix confirmed failures, then continue the next unblocked player-facing feature.

## Next five product improvements
1. Improve counterplay after a screened carrier changes direction or attempts a different Magic Trick.
2. Improve goalkeeper second-ball reaction after catches, punches and rebounds.
3. Continue source-faithful existing-player eight-view Studio work with game-scale screenshots and owner review.
4. Improve Player Studio live preview and directional customization usability.
5. Deepen Career/Cup season progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or visual approval claims; no routine LAN/P2P work. #48 stays open; #87 protection and #86 Render drift remain unresolved.

## Evidence
- .197 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45044723093
- .197 dev Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45044723094
- .197 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988
- .197 main Census retry: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045564160
- .198 Modular QA/Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45047592907 and https://github.com/saeedsai/SuperMagicFootball/actions/runs/45047592941

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
