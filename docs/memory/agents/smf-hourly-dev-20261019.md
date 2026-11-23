# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.225 candidate:** MAGIC-TRICK-SCREEN-BALL-SIDE-READ-01 makes a second-defender first-touch Magic Trick screen read depend on the live carried-ball side. A screen cannot counter when the ball is shielded on the far side, stale, invalid or owned by someone else. Ordinary nearest-defender facing/closing counters and Dribble Styles remain unchanged.
- **.224 main-promoted:** exact-head Modular QA #45154918639 and dev Full Regression Census #45154918505 passed. QA-gated promotion advanced main/dev to `8cfa6b63db5b141489b77a50ccf5a88ceffdacd7`; Pages #45156349943 and independent main Census/hosted smoke #45156361431 passed.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .225. Verify exposed-versus-shielded screen reads in both directions on Node and desktop/simulated touch. Fix confirmed failures, then continue the next gameplay improvement.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .224 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45154918639
- .224 dev Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45154918505
- .224 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45156349943
- .224 main Census/hosted smoke: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45156361431

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
