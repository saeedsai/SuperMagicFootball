# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.240 — AI-PRIMARY-PRESS-BALL-SIDE-APPROACH-01:** the primary CPU presser's moving-carrier target now shades toward the live ball only when it is grounded, owned by the carrier, within 4–36 units and exposed on the defender-facing side. The correction is capped at 8 units and weighted by visible offset and AI anticipation; far-side shielding and invalid/stale states retain the existing target.
- Focused Node coverage checks both team directions, exact offset, actual `driveAI` assignment, far-side shielding, airborne/distant/unowned/invalid ball fallbacks and the existing 34-unit cap. Desktop/simulated-touch Chromium verifies engine wiring and the four actions.
- **.239 gate diagnosis:** Modular QA #45239233351 passed. Census #45239233305 passed preflight, preview, Node shards 0–2 and all four Chromium shards; Node shard 3 timed out only `gk_seeded_match_trials.test.cjs` at 35 seconds (164 PASS, 0 FAIL, 1 TIMEOUT). Failed-job-only retry requested; .239 was not certified or promoted.
- **0.236 main-promoted and independently verified:** exact-head Modular QA #45230734973, Census #45230734550, Pages deployment #45232402587 and main Census #45232414873 passed on SHA `6df2f0af585660824ab890090882d54999cdc62b`.

## Next smallest action
Run exact .240 Modular QA and four-Node/four-Chromium Census; inspect all shard results, repair confirmed failures, then permit only a green exact HEAD through the existing QA-gated promotion. Independently verify main SHA, Pages deployment, main Census and hosted-byte smoke.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .240 feature and exact-head CI: pending at candidate creation.
- .239 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45239233351
- .239 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45239233305
- .236 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45232402587
- .236 main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45232414873

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
