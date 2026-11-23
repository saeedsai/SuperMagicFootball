# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.243 — AI-GROUND-CHALLENGE-BALL-HEIGHT-01:** the shared CPU ground-challenge predicate now requires a finite live-ball height below 20 as well as the existing grounded carrier and defender-facing exposure read. Ordinary close-contact PASS, early PASS and ordinary/first-touch SHOOT ground challenges reject airborne, high, missing or invalid-height balls.
- The existing lofted-pass JUMP interception path is untouched. Grounded ball at 19.99 remains eligible; 20+ fails closed. No ball physics, tackle contact/probability, human input, four actions, saves, rosters, persistence or offline behavior changed.
- Focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both teams and all three AI ground-challenge paths. Exact-head Modular QA and Full Regression Census are pending after this commit.
- **.242 is main-promoted and independently verified:** Modular QA #45272569942 passed 2,826/2,826; Census #45272568926 passed all four Node and four Chromium shards; Pages #45274210026 and independent main Census/hosted smoke #45274222747 passed on SHA `3f26d5b0710cef2f6ec74b33d811341045c74b17`.

## Next smallest action
Observe exact-head .243 Modular QA and Full Regression Census. Fix only confirmed failures, then permit only the green exact dev head through the existing QA-gated main promotion pipeline. Independently verify main SHA, Pages deployment, main Census and hosted-byte smoke; continue to the next gameplay-first backlog item.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .242 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45272569942
- .242 dev Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45272568926
- .242 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45274210026
- .242 main Census/hosted smoke: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45274222747

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.