# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.236 — AI-PASS-INTERCEPTION-AGILITY-MOMENTUM-01:** the second CPU defender's early ground-pass interception now integrates the actual `moveAgile` acceleration ramp and current velocity projected toward the lane. High-Agility or already-approaching defenders can reach a nearer interception point; low-Agility or retreating defenders keep the conservative receiver-lane fallback rather than receiving impossible instant top speed. Missing Agility uses the neutral profile. Pass physics, primary pursuit, four actions, saves, rosters, persistence and offline play are unchanged.
- Mirrored Node and real-engine desktop/simulated-touch Chromium regressions cover both teams, agility boundaries, approach/retreat momentum and neutral fallback. Exact-head Modular QA and four-Node/four-Chromium Census are pending.
- **0.12.81.235 is main-promoted and Pages deployed:** Modular QA #45226481063 and Full Regression Census #45226481135 passed at SHA `6c59fc8d2dc546acdbc26c588042d9ce6e21c401`; Pages deployment #45228344359 succeeded. Independent main Census #45228358896 was still running at this checkpoint.
- .234 exact-head Census #45220399525 failed only the pass-receiver browser fixture; .235 corrected the geometry and then passed the full exact-head dev Census.

## Next smallest action
Run Modular QA and the four-Node/four-Chromium Full Regression Census at the exact current .236 dev HEAD. Fix any confirmed gameplay or browser failure, then permit only a green exact HEAD through the existing QA-gated promotion pipeline and independently verify main SHA, Pages deployment, main Census and hosted-byte smoke.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is not enabled. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .235 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45226481063
- .235 exact-head Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45226481135
- .235 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45228344359
- .235 independent main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45228358896
- .234 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45220399520
- .234 exact-head Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45220399525

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read or edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
