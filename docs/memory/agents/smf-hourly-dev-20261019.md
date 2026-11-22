# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay, presentation and Career/Cup improvements while preserving four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.204 WIND-MUD-2D-REAR-FEINT-01: CPU Wind/Mud counter reactions now use the defender's current 2D movement heading (then velocity, then horizontal-facing fallback). Clear vertical/diagonal rear feints no longer cause a pre-cast JUMP, while lateral peripheral threats remain readable. Existing hold/reaction/counter windows and all four actions are unchanged.
- Also repaired the .203 READ! browser screenshot fixture: both simulated-touch/desktop captures now retain the centered logical camera instead of resetting to stale fixed coordinates. .203 exact-head Census #45064611119 had 67/68 browser scripts pass in shard 3; all four Node shards and browser shards 0–2 passed. Modular QA #45064611126 passed 2,769/2,769. No live cue failure was established.
- .204 exact-head Modular QA/Census pending. Main remains .197 on SHA `734090056af345d76e5d25079b2e2f8c1798ba65`; .204 is dev-only and not release-certified.

## Next smallest action
Run .204 exact-head Modular QA and the four-Node/four-Chromium Full Regression Census. Fix confirmed failures, then continue the ordered product backlog.

## Next five product improvements
1. Improve counterplay readability for remaining counterable Magic Tricks without adding actions.
2. Continue source-faithful existing-player eight-view Studio work with game-scale screenshots and owner review.
3. Improve Player Studio live preview and directional customization usability.
4. Deepen Career/Cup season progression and match presentation.
5. Continue goalkeeper dive/second-ball polish only where a reproducible gameplay gap remains.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or visual approval claims; no routine LAN/P2P work. #48 stays open; #87 protection and #86 Render drift remain unresolved.

## Evidence
- .203 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45064611126
- .203 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45064611119
- .203 screenshot fixture parent: https://github.com/saeedsai/SuperMagicFootball/commit/438db2105634c062be641fb8cbeb18987df4a302

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
