# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve the four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.247 — AI-CARRY-SLIDE-AVOIDANCE-01:** CPU carriers now account for an active incoming SHOOT-slide's swept path in the existing pressure escape. When the slide can reach the near lane within 0.24 seconds, the carrier prefers a safer existing forward diagonal; expired, receding, too-short/late and out-of-lane slides do not trigger an escape. Tackle physics and human input are unchanged.
- Added mirrored Node helper/engine regressions and actual-engine desktop/simulated-touch Chromium coverage for both attack directions, diagonal open-side choice and non-threatening slides. Exact-head gates pending.
- **.246 main-promoted and independently verified:** Modular QA #45302839796 and dev Census #45302839739 passed on SHA 2a04b67f313700dc3040b0f4b929989ecfdd2be6; QA-gated promotion advanced main/dev; Pages #45304190113 and independent main Census/hosted smoke #45304200011 passed all four Node/Chromium shards.

## Next smallest action
Inspect exact-head .247 Modular QA and Full Regression Census, repair only confirmed failures, then allow only a green exact dev head through the existing QA-gated promotion. Independently verify main SHA, Pages deployment, main Census and hosted-byte smoke. Continue with the next unblocked gameplay/graphics/Player Studio improvement.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 remains unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .246 Modular QA #45302839796, dev Census #45302839739, Pages #45304190113 and independent main Census/hosted smoke #45304200011 passed.
- .245 remains the previous verified main release; .244 was superseded before certification.
- #87 branch protection; #86 Render commit-trigger drift; #48 physical two-phone acceptance.

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
