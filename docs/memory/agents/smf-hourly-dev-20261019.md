# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.244 — KEEPER-FATIGUE-CATCH-THRESHOLD-01:** the existing goalkeeper dive catch threshold now falls by up to 10% at full match fatigue. Rested keepers retain the exact prior GK Skill/GK Diving baseline; only borderline high-force shots become parries as fatigue rises. The existing save contact, reach, dive timing, parry direction, rebound and recovery remain unchanged.
- Added mirrored actual-engine Node trials for both goals, rested/half/full fatigue, two borderline shot speeds, invalid/clamped fatigue and weak-versus-elite profiles. Extended actual-engine desktop/simulated-touch Chromium keeper acceptance with ten mirrored catch/parry trials per device. Exact-head gates pending.
- **.243 is main-promoted:** Modular QA #45277794491 and Full Regression Census #45277794208 passed on SHA `b9ba2c91598a49c2cf4199e0fe67fd7e4d99d13e`; all four Node and Chromium jobs passed and the existing promotion job succeeded. Pages deployment and independent main Census/hosted-byte smoke not independently verified here.

## Next smallest action
Observe exact-head .244 Modular QA and Full Regression Census. Fix only confirmed failures, then allow only the green exact dev SHA through the existing QA-gated promotion. Independently verify main SHA, Pages deployment, main Census and hosted-byte smoke; continue to the next unblocked player-facing backlog item.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .243 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45277794491
- .243 Full Regression Census/promotion: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45277794208
- #87 main protection: https://github.com/saeedsai/SuperMagicFootball/issues/87
- #86 Render trigger drift: https://github.com/saeedsai/SuperMagicFootball/issues/86
- #48 physical two-phone acceptance: https://github.com/saeedsai/SuperMagicFootball/issues/48

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
