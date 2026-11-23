# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.239 — AI-PRIMARY-PRESS-GOALWARD-CUTOFF-01:** the primary CPU presser's existing moving-carrier intercept target now gains a small anticipation-scaled bias toward the carrier's attacking goal when the carrier is advancing. This helps cut across the next touch rather than trail the exact run line. Retreating, lateral-only and zero-anticipation cases retain the old velocity-only lead; the full target vector remains capped at 34 units.
- .239 retains .238 **AI-SUPPORT-CARRIER-LATERAL-COVER-01** and **AI-CLOSE-CONTACT-POKE-BALL-SIDE-READ-01**. The support defender tracks bounded lateral carrier drift; ordinary close PASS pokes require the live ball on the defender-facing side, while justified SHOOT slides remain available.
- Focused Node coverage checks both directions, exact goalward offset, retreat/lateral/zero-read fallbacks and real `driveAI` target assignment. Desktop/simulated-touch Chromium continues to exercise the actual engine and four controls.
- **.238 gate status at supersession:** Modular QA #45237598554 passed. Census #45237598365 passed preflight, preview and Node shards 2/3; Node shards 0/1 and all four Chromium shards were still running when .239 began. .238 was not promoted or deployed.
- **0.236 main-promoted and independently verified:** exact-head Modular QA #45230734973, Census #45230734550, Pages deployment #45232402587 and main Census #45232414873 passed on SHA `6df2f0af585660824ab890090882d54999cdc62b`.

## Next smallest action
Inspect exact .239 Modular QA and four-Node/four-Chromium Census; repair confirmed failures, then permit only a green exact HEAD through the existing QA-gated promotion. Independently verify main SHA, Pages deployment, main Census and hosted-byte smoke.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .239 feature commit and exact-head CI: pending at checkpoint creation.
- .238 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45237598554
- .238 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45237598365
- .236 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45232402587
- .236 main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45232414873

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read or edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
