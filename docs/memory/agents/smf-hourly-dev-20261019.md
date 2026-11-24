# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve the four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.246 — AI-GROUND-TRAP-PATH-PRIORITY-01:** when several armed enemy Banana/Ice traps are visible, CPU outfielders now prioritize an already-overlapping trap, then the trap intersecting their current travel lane, ahead of a nearer off-lane trap. If no lane threat exists, nearest-trap fallback remains. Existing reaction delay, safe SHOOT-slide/JUMP counterplay, trap physics and possession are unchanged.
- Added mirrored Node and actual-engine desktop/simulated-touch Chromium regressions for both teams with competing off-lane/in-lane traps. Exact-head .246 gates pending.
- **.245 is main-promoted and independently verified:** Modular QA #45295409477 and dev Census #45295409642 passed on 6567281f762da462983a1cb72353cc07bad95d1c; QA-gated promotion succeeded; Pages #45296742349 and main Census #45296751680 passed, including hosted smoke and all four Node/Chromium shards.
- .245 retained the goalkeeper fatigue catch threshold and first-frame CPU JUMP trap counter.

## Next smallest action
Inspect exact-head .246 Modular QA and Full Regression Census, repair only confirmed failures, then allow only a green exact dev head through the existing QA-gated promotion. Independently verify main SHA, Pages deployment, main Census and hosted-byte smoke. Continue with the next unblocked gameplay/graphics/Player Studio improvement.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 remains unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .245 Modular QA #45295409477 and dev Census #45295409642 passed; Pages #45296742349 and independent main Census #45296751680 passed.
- .244 superseded before certification due the stale keeper_parry_lane source contract; .245 repaired it and added trap JUMP counterplay.
- #87 branch protection; #86 Render commit-trigger drift; #48 physical two-phone acceptance.

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
