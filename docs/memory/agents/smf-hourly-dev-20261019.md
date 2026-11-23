# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.226 candidate:** AI-SUPPORT-RUN-RECEIVER-ORIENTATION-01 adds a bounded 22-unit tie-breaker so CPU attacking support runs prefer a receiver already facing goal. Forward momentum >=110 units/s overrides stale facing; a sole safe runner remains eligible. Lane geometry, defender/crowding checks and pass physics are unchanged.
- **.225 promoted:** Modular QA #45163695506 and dev Census #45163695496 passed at SHA `91adea9bad06524c3022e7ee60a8ece58fb16142`; QA-gated promotion advanced main/dev and Pages #45165193079 succeeded. Independent main Census #45165206483 failed only historical `lan_auto_two_browser_qa.py` (10-second guest-movement timeout); companion two-client browser test passed. Failed-job-only retry requested.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .226. Confirm the mirrored support-run selection in desktop and simulated-touch Chromium, fix any confirmed failures, then continue the next gameplay/backlog item.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .225 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45163695506
- .225 dev Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45163695496
- .225 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45165193079
- .225 main Census / retry: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45165206483

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
