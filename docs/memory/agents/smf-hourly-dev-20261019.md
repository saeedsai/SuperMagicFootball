# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay, presentation and Career/Cup improvements while preserving four actions, canonical rosters, saves and offline play.

## Current checkpoint
- **.186 CUSTOM-LEAGUE-AWAY-FIXTURE-01:** Custom League scheduled-away fixtures now start with the opponent on engine home side and the selected club on away side. Match scores and token win/loss are normalized to club perspective before standings/history update. Version-1 campaign schema, team IDs, save slots and four actions remain unchanged.
- .185 contested-cross punch attribution follow-up passed Modular QA #45012643434 and Full Regression Census #45012643513 (four Node + four Chromium shards); QA-gated promotion advanced main/dev to `a62b800892c7a49dc8a253f664e58e948bae56dc`. Pages deployment #45013420954 and main Census #45013426621 were running when .186 began.
- #87 remains open; GitHub REST reports main and dev unprotected. #48 physical two-phone acceptance and #86 Render drift remain open. #10 existing-player graphics remains subject to the documented source/visual acceptance gate. No LAN/P2P or art changes in this increment.

## Next smallest action
Run exact-head focused Node and desktop/simulated-touch Chromium acceptance for .186, then Modular QA and all four Node/four Chromium Full Regression Census shards. Fix confirmed failures before QA-gated promotion; verify Pages and main hosted smoke separately.

## Next five product improvements
1. Improve CPU through-ball interception timing against moving receivers without duplicating existing low/lofted pass cover.
2. Improve goalkeeper rebound recovery after contested punches and catches.
3. Resume existing-player eight-view source-faithful graphics after the graphics lock is released and Studio/game-scale review is available.
4. Improve Player Studio live preview and directional customization usability.
5. Improve Career/Cup season progression and away-fixture presentation beyond the corrected Custom League path.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, existing saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or visual approval claims; no routine LAN/P2P work.

## Evidence
- .185 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45012643434
- .185 Full Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45012643513
- .185 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45013420954
- .185 main Census/hosted smoke: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45013426621

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
