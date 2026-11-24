# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.245 — AI-GROUND-TRAP-JUMP-COUNTER-01:** CPU outfielders now use the existing JUMP when an armed enemy Banana Peel or Ice Patch is immediately in their path and a safe SHOOT-slide sweep is unavailable. A live first-frame JUMP counts as airborne before z reaches 20; CPU jumpers continue moving away while airborne. Carrying possession is retained; safe slide disarms remain preferred.
- Retained .244 goalkeeper fatigue catch threshold (rested baseline unchanged, maximum 10% reduction at full fatigue). Repaired the confirmed stale .244 keeper_parry_lane source assertion.
- Added Node and actual-engine desktop/simulated-touch Chromium regressions for both trap types, both teams, possession retention, active/expired JUMP and 30/60/120-Hz behavior. First .245 Node run found a test-fixture ReferenceError (`carrier`/`field` undefined); fixed the fixture and updated the specialist contract. New exact-head gates pending.
- **.243 is main-promoted and independently verified:** Modular QA #45277794491 and dev Census #45277794208 passed; Pages #45279545316 and independent main Census #45279561456 passed, including hosted smoke and all four Node/Chromium shards.

## Next smallest action
Inspect exact-head .245 Modular QA and Full Regression Census; fix only confirmed failures. Promote only through the existing green exact-head pipeline, then independently verify main SHA, Pages deployment, main Census and hosted-byte smoke. Continue with the next unblocked gameplay/Player Studio/graphics item.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .244 exact-head Modular QA #45287053683 and Census #45287053639 failed only the stale keeper catch source contract.
- .243 Modular QA #45277794491; Census #45277794208; Pages #45279545316; main Census #45279561456.
- #87 main protection; #86 Render trigger drift; #48 physical two-phone acceptance.

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
