# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.340 — AI-SHOT-LANE-ARRIVAL-READ-01:** CPU shot-lane scoring now predicts active defenders at the time the ball reaches their lane, using the existing Agility-limited turn model and a 45-unit per-axis cap. A defender moving into a preferred lane can make the CPU choose the clearer side; stationary blockers retain the prior lane ranking. Human aim and shot physics are unchanged.
- .339 exact-head Census #45877252748 exposed three browser-fixture failures in Scream, Spin/Sand and Hide Ball selected-human backup acceptance. The .340 follow-up isolates the intended counter state and keeps actual engine helper/resolver calls; no production defect was established in those three fixtures.
- New focused Node and actual-engine desktop/simulated-touch Chromium regressions cover mirrored shot-lane arrival, Agility ordering, stationary fallback, human aim and four actions.

## Next smallest action
Inspect exact-head .340 Modular QA and all four Node/four Chromium Census jobs. Fix confirmed failures, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next unfinished gameplay or existing-player graphics item.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Starting dev SHA: `1d460a69db941d00de6159541a959f661f1e9c4c`; main SHA: `a8edae04834d16a11292617e8d0d52abbd66eb4f`.
- .339 Modular QA #45877252730 passed 2,968/2,968; Keeper Save Event Integrity #45877252694 passed.
- .339 Full Regression Census #45877252748 failed three browser shards (Scream selected-human backup, Spin/Sand duplicate-counter resolver fixture, Hide Ball backup-poke resolver fixture); exact fixture repairs are included in .340.
- Main .336 exact-head Census #45846445829 and Pages deployment #45846426105 passed; hosted Pages smoke passed.
- GitHub REST reports `main.protected=false` and `dev.protected=false`; #87 remains open. #48 and #86 remain open.

## Cleanup
Only this agent's checkpoint was replaced. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.