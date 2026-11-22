# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- **.182 AI-CARRY-ESCAPE-MOMENTUM-CONTINUITY-01:** CPU carriers under front pressure now use current forward/lateral movement as a capped 14-point tie-breaker between safe diagonal escape lanes (active from 85 units/s; disabled for strongly retreating carriers). Defender projection, carry-corridor safety and teammate crowding remain dominant; a blocked momentum-favoured lane yields to the safer alternative. Direct-lane fallback, first-touch/final-third exclusions, speed, ball physics, controls, saves and rosters unchanged.
- Added mirrored helper/real-engine Node regressions and desktop/simulated-touch Chromium acceptance, including safety override.
- Exact-head Modular QA #45007482553 and Full Regression Census #45007482525 both failed only because this checkpoint lacked the required `## Current checkpoint` heading; each ran 2,720 Node tests with 2,719 passing and one memory-contract failure. The four .182 gameplay regressions passed. Repair the heading before rerunning gates. Local git clone was blocked by github.com DNS; source and branch operations use connected GitHub REST. No local test result is claimed.
- **.181 fully main-promoted and deployed:** Modular QA #45002647169 passed 2,719/2,719; Full Regression Census #45002647197 passed preflight, preview, all four Node and all four Chromium shards, and QA-gated promotion. Main/dev SHA: `c297903e19cf3bef48846abef250f9be97ff7b59`. Pages #45003457564 and main Census/hosted smoke #45003463439 passed all eight shards.
- #87 main protection, #48 physical two-phone acceptance, #86 Render drift and #10 owner graphics acceptance remain open. #10's graphics-renderer lock remains active; no art or LAN/P2P runtime work was attempted.

## Next smallest action
- Repair the known .182 memory-contract gate, then deliver the next bounded player-facing CPU counterpress improvement on a fresh dev head.

## Next five product improvements
1. CPU counterpress and turnover recovery coordination.
2. Existing-player eight-view graphics after graphics lock release and real game-scale approval.
3. Goalkeeper dive/catch decisions and rebound recovery.
4. Player Studio live appearance preview and directional consistency.
5. Career/Cup scheduled-away match presentation and season progression.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 canonical teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No physical-device or visual approval claims.

## Evidence
- .181 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45002647169
- .181 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45002647197
- .181 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45003457564
- .181 main Census/hosted smoke: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45003463439

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.