# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-19

## Mission
Ship player-facing gameplay, counterable four-action Magic Tricks, original eight-view graphics, goalkeeper, Player Studio and Career improvements while preserving roster, saves, offline and four-button invariants.

## Current checkpoint
- Candidate 0.12.81.102: KNOCKDOWN-RECEIVER-READY-01: PASS favors upright over knocked-down/getting-up receivers; lone target remains available; focused regression committed, exact-head QA pending.
- Candidate 0.12.81.101: RETREAT-RECEIVER-READY-01: Directed PASS slightly favors a settled teammate over a similarly placed receiver sprinting backward toward the passer; lone retreating receivers remain selectable and invalid motion remains neutral. Four controls, saves and ball physics unchanged. Exact-head QA pending.
- Candidate 0.12.81.100: Directed PASS favors upright receivers over active sliding teammates; focused regression committed; QA pending.
- Candidate 0.12.81.99: Close-range defensive PASS pokes gain a slightly wider Hide Ball aim cone; focused regression committed; exact-head QA pending.
- Candidate 0.12.81.98: directional PASS-poke cone against Hide Ball; focused regression committed, exact-head CI pending.
- Candidate 0.12.81.97: occupied moving-receiver arrival space now receives bounded crowding penalty; focused regression added; CI pending.
- Candidate 0.12.81.96: active JUMP timer required for Teleport landing counter; focused regression updated; exact-head QA pending.
- Candidate 0.12.81.94: ordinary-only early keeper read; straight Magic shots retain shorter window. Focused regression added; QA pending.
- Candidate 0.12.81.93: skill-scaled predictable-shot dive anticipation and syntax repair. CI pending; do not claim release.
- Candidate 0.12.81.92: KEEPER-EARLY-READ-01: Goalkeepers start a visible dive earlier against predictable incoming shots, while erratic Magic shots keep the existing late-read window. Catch reach, shot physics, four controls and saves remain unchanged. Exact-head QA pending.
- Breath .66–.68 already delivered; do not revisit without a reproducible failure.
- Main protection #87, Render drift #86 and physical LAN acceptance #48 remain unresolved.

- 0.12.81.95 TELEPORT-JUMP-LANDING-01: Timed JUMP in Teleport landing lane now counters arrival; focused regression committed, exact-head QA pending.

## Next smallest action
1. Observe exact-head Full Regression Census and Modular QA; repair confirmed failures.
2. Add responsive Magic Trick counterplay using only Pass/Shoot/Dribble/Jump.
3. Improve goalkeeper dive/catch timing with focused regression.
4. Advance original eight-view assets through Studio and actual game-scale visual QA.
5. Improve Player Studio previews and Career presentation.

## Ownership and exclusions
Own only this checkpoint; do not edit other agents' checkpoints. Work on existing dev; never bypass CI/security or push main manually. Preserve 223 teams, 2676 players, six formations, ten Career/Cup slots and SD09.

## Evidence
- 0.12.81.91 keeper source and focused Node regression authored; exact-head CI not yet observed.

## Cleanup
Keep this checkpoint under 4 KiB; no extra branches or temporary assets.
