# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.222 candidate:** AI-POKE-READ-DEFENCE-SCALING-01 scales the ordinary CPU short PASS-poke closing threshold by Defence (105–135 units/s; average remains 120), while preserving the existing range, forward arc, prediction and contact-distance gates.
- **Magic Trick counterpress continuity:** a successful second-defender screen read remains actionable for its bounded .42-second movement-only window even if the reader turns before the next AI tick. No automatic tackle or possession change.
- Exact-head Node and desktop/simulated-touch browser regressions cover both improvements and the prior real-engine Magic Trick target failure.
- **.221 Modular QA #45145591587 passed.** Census #45145591484 failed browser shard 3 only at the Magic Trick secondary-screen counterpress target (103.2 units ahead versus required 42–72); 68 other scripts in that shard passed. .221 is not certified/promoted.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .222. Fix confirmed source or harness failures, then continue an independent gameplay improvement while gates run.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .221 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45145591587
- .221 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45145591484
- .218 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45131091490

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
