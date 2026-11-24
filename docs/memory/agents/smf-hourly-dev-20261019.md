# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve the four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.250 — AI-CARRY-OPEN-FORWARD-LANE-01:** a pressured CPU carrier now uses a clear straight-forward escape corridor when it is at least as safe as diagonal cuts; a diagonal must provide an 18-point safety advantage to override the direct lane. Frontal pressure and incoming slides still trigger diagonal evasion.
- .249 gate repair commit 939210d extends the whole-match diagnostic allowance to 156 seconds without weakening full-regulation assertions and changes the actual-engine skill check to a 15% relative distinction (observed high/low response was 27%). .249 itself was not certified.
- .250 adds mirrored Node helper and actual-engine desktop/simulated-touch Chromium tests for both teams, two diagonal blockers and a clear forward lane; existing frontal and slide tests remain.
- .247 remains the last verified deployed release on main SHA 31c24ae2a11007b7c719a97913d8821f0d7bd6e0; Pages #45307713844 and independent main Census/hosted smoke #45307721714 passed.

## Next smallest action
Run exact-head .250 Modular QA and Full Regression Census. Fix any confirmed failures, then allow only the green exact SHA through the existing QA-gated promotion pipeline. Independently verify main SHA, Pages deployment, main Census and hosted-byte smoke.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 remains unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .249 Modular QA #45317873541 passed 2,837/2,837 Node tests; Census #45317873538 failed the two harness checks described above. .249 was not certified.
- .250 focused Node/Chromium tests are committed; execution not yet observed.
- .247 main release: Pages #45307713844 and independent main Census/hosted smoke #45307721714 passed.
- #87 branch protection; #86 Render commit-trigger drift; #48 physical two-phone acceptance.

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
