# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.237 — AI-CLOSE-CONTACT-POKE-BALL-SIDE-READ-01:** ordinary and primary CPU defenders now require a live defender-facing ball read before a close-contact non-slide PASS poke. A far-side shield keeps pursuit instead of producing a body-only turnover; a physically justified SHOOT slide remains available. The early 68–94-unit poke read reuses the same 36-unit carried-ball envelope. Human tackles, tackle physics, cooldown, stamina, ball flight, four actions, saves, rosters, persistence and offline play are unchanged.
- Mirrored Node regressions cover exposed/shielded, both sides, ownership mismatch, stale positions and invalid coordinates. Actual-engine desktop/simulated-touch Chromium QA drives driveAI and checks exposed versus shielded close-contact decisions, 223 canonical teams and four controls. Exact-head Modular QA and Full Regression Census are pending.
- **0.12.81.236 is main-promoted and Pages deployed:** Modular QA #45230734973 and Full Regression Census #45230734550 passed on SHA `6df2f0af585660824ab890090882d54999cdc62b`; the QA-gated workflow promoted main/dev to the same SHA. Pages deployment #45232402587 succeeded. Independent main Census #45232414873 was running at .237 start; its hosted-pages smoke passed.

## Next smallest action
Run Modular QA and the four-Node/four-Chromium Full Regression Census at the exact .237 dev HEAD. Inspect the actual-engine close-contact desktop/touch assertions; fix any confirmed failure, then allow only a green exact HEAD through the existing QA-gated promotion pipeline and independently verify main SHA, Pages deployment, main Census and hosted-byte smoke.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .236 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45230734973
- .236 exact-head Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45230734550
- .236 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45232402587
- .236 independent main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45232414873
- .237 source and regressions: awaiting exact-head CI triggered by this commit.

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read or edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
