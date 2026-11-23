# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.241 — AI-SLIDE-TACKLE-BALL-SIDE-READ-01:** CPU SHOOT slides now require the live carried ball to be owned by the carrier, within 36 units and exposed toward the approaching defender. Far-side shielding, stale/mismatched/unowned/invalid balls cannot trigger body-only slides. Pressured first-touch slides use the same read.
- Existing run-up, facing, relative-motion, range, skill/difficulty/fatigue probability and tackle contact remain unchanged. Human controls are unchanged.
- Focused mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover exposed/shielded balls, both directions, ordinary close-contact slides and pressured first-touch slides.
- **0.12.81.240 main-promoted and independently verified:** exact-head Modular QA #45247434934 and Census #45247434925 passed; Pages #45249118267 and independent main Census/hosted smoke #45249131735 passed. Main and dev were aligned at SHA `c764315e0cbcc2fb8b2b68125a72c333bf8ee3c5` before .241.

## Next smallest action
Run exact .241 Modular QA and four-Node/four-Chromium Full Regression Census. Inspect every shard, fix confirmed failures, then allow only a green exact dev HEAD through the existing QA-gated promotion pipeline. Independently verify main SHA, Pages deployment, main Census and hosted-byte smoke.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .240 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45247434934
- .240 dev Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45247434925
- .240 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45249118267
- .240 main Census/hosted smoke: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45249131735

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
