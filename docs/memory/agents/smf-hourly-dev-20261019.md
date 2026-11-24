# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve the four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.249 — AI-PRESSURED-CARRY-RETAIN-ESCAPE-01:** a pressured CPU carrier now keeps possession and uses the existing Dribbling-scaled escape when no validated safe support, cutback, through-ball, goalmouth, give-and-go or first-touch outlet exists. Safe outlet and near-goal shot priorities remain ahead of carry retention.
- Repaired the .248 Chromium skill regression: the old 36-frame fixture reset the carrier to the same coordinates every frame, artificially triggering the AI stuck-player detour and obscuring the selected skill-scaled route. The actual-engine check now observes the first live movement decision. Added mirrored Node and desktop/simulated-touch acceptance for pressured possession retention and forward escape. Exact-head CI pending.
- **.247 main-promoted and independently verified:** Modular QA #45306378261 and dev Census #45306378185 passed on SHA `31c24ae2a11007b7c719a97913d8821f0d7bd6e0`; Pages #45307713844 and independent main Census/hosted smoke #45307721714 passed all four Node/Chromium shards.

## Next smallest action
Inspect exact-head .249 Modular QA and Full Regression Census; repair confirmed failures only. Promote only through the existing green exact-head QA pipeline, then independently verify main SHA, Pages deployment, main Census and hosted-byte smoke. Continue with the next unblocked gameplay improvement.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 remains unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .248 Modular QA #45310012247 passed 2,836/2,836 Node tests; Census #45310012217 failed only the actual-engine carry-skill browser assertion after its repeated-position fixture triggered the separate stuck-player detour. Other 69 browser scripts passed.
- .247 Modular QA #45306378261, dev Census #45306378185, Pages #45307713844 and independent main Census/hosted smoke #45307721714 passed.
- #87 branch protection; #86 Render commit-trigger drift; #48 physical two-phone acceptance.

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
