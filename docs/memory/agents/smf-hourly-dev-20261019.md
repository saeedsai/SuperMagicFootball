# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.240 — AI-PRIMARY-PRESS-BALL-SIDE-APPROACH-01:** the primary CPU presser's moving-carrier target now shades toward the live ball only when it is grounded, owned by the carrier, within 4–36 units and exposed on the defender-facing side. The correction is capped at 8 units and weighted by visible offset and AI anticipation; far-side shielding and invalid or mismatched ball states retain the existing target.
- Focused Node coverage checks both team directions, exact offset, actual `driveAI` assignment, far-side shielding, airborne/distant/unowned/invalid ball fallbacks and the existing 34-unit cap. Desktop/simulated-touch Chromium verifies engine wiring and the four actions.
- **.239 main-promoted:** Modular QA #45239233351 passed. Initial Census #45239233305 timed out only `gk_seeded_match_trials.test.cjs`; failed-job-only retry passed all four Node and all four Chromium shards and QA-gated promotion succeeded. Pages #45246262666 succeeded; independent main Census #45246274293 passed preflight, preview and hosted smoke plus Node shards 2/3, with remaining shards running.
- **0.236 main-promoted and independently verified:** exact-head Modular QA #45230734973, Census #45230734550, Pages deployment #45232402587 and main Census #45232414873 passed on SHA `6df2f0af585660824ab890090882d54999cdc62b`.

## Next smallest action
Run exact .240 Modular QA and four-Node/four-Chromium Census; inspect all shard results, repair confirmed failures, then permit only a green exact HEAD through the existing QA-gated promotion. Independently verify main SHA, Pages deployment, main Census and hosted-byte smoke.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .240 Modular QA #45246776103 passed 2,824/2,824; Census #45246777015 passed preflight, preview and Node shards 2/3; Node shards 0/1 and four Chromium shards were still running.
- .239 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45239233351
- .239 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45239233305
- .239 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45246262666
- .239 main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45246274293

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
