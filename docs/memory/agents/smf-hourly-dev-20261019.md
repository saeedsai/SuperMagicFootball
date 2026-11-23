# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.218 candidate — FIRST-TOUCH-SKILL-PACE-01:** pressured low ground-pass receptions now use a short movement-only settling window scaled by incoming speed and receiver Dribbling (0.18–0.30 seconds). Better ball controllers settle sooner; fast passes and weaker touches take longer. Directional input and immediate actions remain available; CPU interception escape/outlet timing follows the same window. Ball flight, tackle odds, four actions, saves, rosters, persistence and offline play are unchanged.
- Added focused actual-engine Node coverage and desktop/simulated-touch Chromium coverage for both sides, multiple receiver skills/pass speeds and 30/60/120 FPS.
- **.217 exact-head status:** Modular QA #45122614499 passed 2,787/2,787. Census #45122614475 passed preflight, preview, all four Node shards and browser shards 0/2/3; browser shard 1 failed only the historical `lan_auto_two_browser_qa.py` 10-second guest movement wait. Other two-client LAN browser coverage passed. Failed-job-only retry requested; no LAN source changed and no production LAN regression established. .217 is not certified/promoted.
- **0.12.81.216 main-promoted:** SHA `e28c8eaa23096b7c206e737dc905e17e9efe9d97`; exact-head QA/Census, QA-gated promotion, Pages deployment #45119977629 and independent main Census/hosted smoke #45119984419 passed.

## Next smallest action
Verify .218 focused Node/Chromium and exact-head four-Node/four-Chromium Census. Fix only observed failures, then continue the next unblocked gameplay backlog item; do not resume routine LAN/P2P work.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .217 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45122614499
- .217 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45122614475
- .216 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45119977629
- .216 independent main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45119984419

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
