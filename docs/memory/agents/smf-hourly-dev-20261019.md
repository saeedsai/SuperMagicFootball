# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.227 candidate:** AI-THIRD-MAN-MOMENTUM-LANE-01 adds a bounded (±9 score units) preference for an eligible third-man runner already moving toward the complementary open lane. Defensive pressure, corridor safety, crowding and lane geometry remain dominant. Mirrored Node and real-engine desktop/simulated-touch Chromium regressions added.
- **.226 exact-head status:** Modular QA #45172577334 passed. Census #45172577337 passed preflight, preview, four Node shards and browser shards 0/1/3; shard 2 failed only hosted lan_render_hosted_browser_qa.py while waiting 45.85s for the public Pages game object. The other 68 browser scripts passed. Failed-job-only retry is running; .226 is not promoted or deployed.
- **.225 main release:** Pages #45165193079 and independent main Census #45165206483 succeeded on `91adea9bad06524c3022e7ee60a8ece58fb16142`.

## Next smallest action
Inspect .226 retry and .227 exact-head Modular QA/Census. Fix confirmed source or acceptance failures; do not change LAN production for a hosted Pages/Render timeout without reproducible LAN evidence. Then continue the next uncompleted gameplay item.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .226 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45172577334
- .226 Census / retry: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45172577337
- .225 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45165193079
- .225 main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45165206483

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
