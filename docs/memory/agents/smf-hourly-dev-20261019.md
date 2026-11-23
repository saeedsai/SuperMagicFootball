# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.217 candidate — KEEPER-FATIGUE-DIVE-READ-01:** predictable ordinary shots use a skill-scaled 320–390-unit early dive-intent window shortened by up to 45 units at full fatigue. A rested elite keeper shows the visible dive cue earlier; a tired keeper keeps the existing late read. Magic-shot timing, prediction, physical contact/save reach, cooldown, four actions, saves, rosters, persistence and offline play are unchanged.
- Added an actual-engine Node regression and desktop/simulated-touch Chromium acceptance on both goals: at 360 units a rested elite keeper shows early intent while a fully fatigued keeper waits; the fatigued keeper still reads at 330 units. All cases assert unchanged ball flight.
- **0.12.81.216 main-promoted:** SHA `e28c8eaa23096b7c206e737dc905e17e9efe9d97`. Modular QA #45118827968 and dev Census #45118828057 passed; QA-gated promotion succeeded; Pages #45119977629 and independent main Census/hosted smoke #45119984419 passed.
- .216 Full Regression Census included all four Node and four Chromium shards. No local test execution is claimed.

## Next smallest action
Inspect .217 exact-head Modular QA and Full Regression Census. Fix only observed failures, then continue with the next bounded AI passing/interception or goalkeeper behavior from the canonical backlog.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Do not change routine LAN/P2P; physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .216 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45118827968
- .216 dev Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45118828057
- .216 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45119977629
- .216 independent main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45119984419

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
