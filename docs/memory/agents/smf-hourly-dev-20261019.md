# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay, presentation and Career/Cup improvements while preserving four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.203 KEEPER-REBOUND-ARRIVAL-RACE-01: CPU goalkeeper rebound pursuit now projects active outfielders through up to .34 seconds of the ball's remaining descent (110-unit cap). A closing opponent who can occupy the landing pocket wins the second-ball race; retreating opponents no longer suppress a safe keeper chase. No physics/save reach/action/persistence changes.
- Commit includes mirrored helper, real-engine and desktop/simulated-touch regressions. The previous .202 Modular QA passed 2,768/2,768; its Census failed only the simulated-touch READ! screenshot fixture, repaired in parent commit 438db210 by centering the cue subject in the logical camera. .203 exact-head QA/Census pending.
- Main remains .197 on SHA `734090056af345d76e5d25079b2e2f8c1798ba65`; .203 is dev-only and not release-certified.

## Next smallest action
Run .203 exact-head Modular QA and the four-Node/four-Chromium Full Regression Census. Fix any confirmed failure, then continue the ordered product backlog.

## Next five product improvements
1. Improve counterplay readability for other counterable Magic Tricks without adding actions.
2. Continue source-faithful existing-player eight-view Studio work with game-scale screenshots and owner review.
3. Improve Player Studio live preview and directional customization usability.
4. Deepen Career/Cup season progression and match presentation.
5. Continue goalkeeper dive/second-ball polish only where a reproducible gameplay gap remains.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or visual approval claims; no routine LAN/P2P work. #48 stays open; #87 protection and #86 Render drift remain unresolved.

## Evidence
- .202 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45062116888
- .202 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45062116911
- Screenshot fixture repair: https://github.com/saeedsai/SuperMagicFootball/commit/438db2105634c062be641fb8cbeb18987df4a302

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
