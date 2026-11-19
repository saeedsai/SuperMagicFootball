# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-19

## Mission
Ship player-facing gameplay, counterable four-action Magic Tricks, original eight-view graphics, goalkeeper, Player Studio and Career improvements while preserving roster, saves, offline and four-button invariants.

## Current checkpoint
- 0.12.81.109: SLIDE-VALID-TARGET-01 slide target eligibility matches contact eligibility; regression added; exact-head QA pending.
- 0.12.81.108: bounded slide target lead against moving carriers; focused regression added; QA pending.\n- 0.12.81.107: slide contact excludes high jumpers and already-downed opponents; focused Node regression added; exact-head QA pending.\n
- Candidate 0.12.81.106: HURT-RECEIVER-READY-01: active contact recoil modestly lowers receiver priority, lone target remains valid; focused regression added, QA pending.
- Candidate 0.12.81.105: AIRBORNE-LANE-READ-01 ground passes ignore high airborne defenders in lane and reception crowding; focused regression added; exact-head QA pending.
- Candidate 0.12.81.104: DOWNED-ARRIVAL-CROWD-01 excludes downed/getting-up defenders from moving receiver crowding; regression committed, QA pending.
- Candidate 0.12.81.103: DOWNED-LANE-READ-01: PASS ignores knocked-down defenders as blockers; focused regression added; exact-head QA pending.
- Candidate 0.12.81.102: KNOCKDOWN-RECEIVER-READY-01: PASS favors upright over knocked-down/getting-up receivers; lone target remains available; focused regression committed, exact-head QA pending.
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
