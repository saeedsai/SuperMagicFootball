# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.258 — AI-GROUND-SPILL-PRIMARY-LANDING-READ-01:** the primary CPU presser now meets the same bounded landing point as the second defender for fresh low tackle/deflection spills and short rolling rebounds. Both directions share one validated bounce/roll estimate; support retains its 26-unit goal-side pocket. Stale balls, passes, shots, high balls, keeper logic and physics remain unchanged.
- Mirrored Node and actual-engine desktop/simulated-touch Chromium acceptance checks both defenders against fresh bounce and rolling landing points, 26-unit spacing, invalid states, four controls and 223 teams. Exact-head QA/Census pending.
- **0.12.81.257 main-promoted:** Modular QA #45359029329 passed 2,846/2,846; Full Regression Census #45359029366 passed all four Node and four Chromium shards. QA-gated promotion advanced main to `0166d774dab21e6495cfc4ea4f5fd6d86c41db90`; Pages #45360399875 succeeded; independent main Census #45360411104 passed all shards and hosted-pages smoke.
- Main protection #87 remains open; REST reports `protected=false`. Physical #48 and Render drift #86 remain open. No physical-device or authenticated-online-hosting claim.

## Next smallest action
Inspect .258 exact-head Modular QA and Full Regression Census; fix only confirmed failures. Promote only the exact green dev head through the existing QA-gated pipeline, then verify Pages and independent main Census/hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Do not read/edit another agent's checkpoint or claim unverified art, device or hosting acceptance.

## Evidence
- .257 exact dev Census and main Census passed all four Node and four Chromium shards; Pages deployment and hosted smoke passed.
- .258 gameplay source and focused Node/desktop/simulated-touch Chromium regressions committed on dev; exact-head CI pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
