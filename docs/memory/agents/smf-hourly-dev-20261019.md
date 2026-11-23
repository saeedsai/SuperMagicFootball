# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.238 — AI-SUPPORT-CARRIER-LATERAL-COVER-01:** the CPU second defender now projects short lateral carrier drift when selecting its goal-side support screen, capped at 36 units. Stationary-carrier target remains exactly unchanged. Magic-read, established pass/cutback, first-touch and turnover counterpress cover retain priority. No movement physics, ball behavior, tackle physics, four actions, saves, rosters, persistence or offline changes.
- .238 also retains **AI-CLOSE-CONTACT-POKE-BALL-SIDE-READ-01**: ordinary and primary close-contact non-slide CPU pokes require the live ball on the defender-facing side; far-side shielding prevents a body-only turnover, while justified SHOOT slides remain available.
- Node regressions cover both teams, mirrored lateral movement, stationary parity, cap/bounds/invalid inputs and ball-side exposed/shielded cases. Actual-engine desktop/simulated-touch QA drives support assignment and close-contact decisions, checking 223 teams and four actions.
- **.237 gate diagnosis:** Modular QA #45235676805 and Full Census #45235676647 failed Node preflight on a redundant old source-string assertion that still expected the unguarded close-contact poke. The replacement contract already covers the new behavior; .238 removes the obsolete assertion. Concept Hero QA #45235676706 hit the same failure. No Chromium release gate completed on .237.
- **0.12.81.236 main-promoted and fully verified:** Modular QA #45230734973, exact-head Census #45230734550, Pages deployment #45232402587 and independent main Census #45232414873 all passed. Main and dev were identical at SHA `6df2f0af585660824ab890090882d54999cdc62b` before .237.

## Next smallest action
Run Modular QA and the four-Node/four-Chromium Full Regression Census at the exact .238 dev HEAD. Inspect both actual-engine desktop/touch suites; fix confirmed failures, then allow only a green exact HEAD through the existing QA-gated promotion pipeline. Independently verify main SHA, Pages deployment, main Census and hosted-byte smoke.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .236 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45230734973
- .236 exact-head Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45230734550
- .236 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45232402587
- .236 main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45232414873
- .237 failed Node preflight: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45235676805
- .238 source and regressions: exact-head CI pending.

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read or edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
