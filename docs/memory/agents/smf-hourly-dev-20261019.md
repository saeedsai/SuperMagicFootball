# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-19

## Mission
Ship player-facing gameplay, counterable four-action Magic Tricks, original eight-view graphics, goalkeeper, Player Studio and Career improvements while preserving roster, saves, offline and four-button invariants.

## Current checkpoint
- Candidate 0.12.81.98: directional PASS-poke cone against Hide Ball; focused regression committed, exact-head CI pending.
- Candidate 0.12.81.97: occupied moving-receiver arrival space now receives bounded crowding penalty; focused regression added; CI pending.
- Candidate 0.12.81.96: active JUMP timer required for Teleport landing counter; focused regression updated; exact-head QA pending.
- Candidate 0.12.81.94: ordinary-only early keeper read; straight Magic shots retain shorter window. Focused regression added; QA pending.
- Candidate 0.12.81.93: skill-scaled predictable-shot dive anticipation and syntax repair. CI pending; do not claim release.
- Candidate 0.12.81.92: KEEPER-EARLY-READ-01: Goalkeepers start a visible dive earlier against predictable incoming shots, while erratic Magic shots keep the existing late-read window. Catch reach, shot physics, four controls and saves remain unchanged. Exact-head QA pending.
- Candidate 0.12.81.91: KEEPER-READABLE-FLIGHT-01: Goalkeepers gain a small bounded lateral catch-reach benefit when an ordinary incoming shot gives ample reaction time; point-blank and erratic Magic shots do not. Four controls, saves and ball physics unchanged. Exact-head QA pending.
- Candidate 0.12.81.90: bounded moving-receiver lane pressure; focused regression committed, exact-head QA pending.
- Candidate 0.12.81.89: receiver arrival-angle pass scoring, focused regression committed; exact-head QA not yet verified.
- Candidate 0.12.81.88: LATE-LANE-INTERCEPT-01 guards against defenders closing an early ground-pass lane point only after ball arrival; focused regression committed on dev.
- Candidate .87: lateral receiver correction and release metadata aligned.
- Prior .87 exact-head Census and Modular QA failed on missing checkpoint heading "Ownership and exclusions"; corrected here. Do not claim full QA or release.
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
Gameplay source and focused regression committed in .88; basic source syntax and directed selection smoke checked. Four Node/four Chromium Census and Modular QA not yet observed passing for .88. No main promotion or hosted verification.

## Cleanup
Keep this checkpoint under 4 KiB; no extra branches or temporary assets.
