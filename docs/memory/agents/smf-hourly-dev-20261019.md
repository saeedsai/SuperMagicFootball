# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.294 — KEEPER-CUTBACK-OPEN-RUNNER-READ-01:** CPU goalkeeper cutback positioning now discounts a runner already within 64 units of a ready defender's bounded 120 ms projected position. Recovery, downed, stunned, airborne and active slide/hurt defenders do not suppress the keeper read; an open alternative remains eligible.
- .293 exact-head Modular QA #45604152084 and Census #45604152073 failed only the project-memory contract: the checkpoint had `## Next action` instead of required `## Next smallest action`. Node recorded 2,895/2,896 passing; the sole failure was that heading contract. The .293 press-turn Node tests passed; Chromium was skipped after Census preflight failed.
- .292 failed-job-only Census retry #45592512918 passed and QA-gated promotion advanced main to `faa2fda91f6c34e49c27adf1d9f5c5e4a5f7452b`. Fresh Pages deployment and independent main Census status still require verification.
- .294 adds focused Node and actual-engine desktop/simulated-touch Chromium coverage for marked versus open cutback runners, both goals and unavailable marker recovery. Exact-head gates are required before promotion.

## Next smallest action
Inspect .294 exact-head Modular QA and four-Node/four-Chromium Census; fix only confirmed failures, then verify QA-gated main promotion, independent main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .293 run #45604152084: 2,895 Node pass / 1 project-memory heading failure; press-turn feature tests passed.
- .293 Census #45604152073 stopped in Node preflight on the same checkpoint heading; no Chromium shard ran.
- Branch heads before .294 integration: dev `29a3de043c8db13faf6935c7025c09668e50ff77`; main `faa2fda91f6c34e49c27adf1d9f5c5e4a5f7452b`.
- GitHub REST branch listing reports dev and main unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.