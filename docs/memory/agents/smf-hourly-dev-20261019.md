# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.259 — AI-LOOSE-BALL-LANDING-ARRIVAL-ASSIGNMENT-01:** for validated descending high loose balls and fresh low ground spills, CPU press roles are selected against the shared predicted landing point. The best-positioned available defender becomes primary; the next eligible defender can hold the existing 26-unit goal-side cover. Passes, shots, stale/invalid balls and concealed positions retain the existing live/known-ball fallback.
- Mirrored Node and actual-engine desktop/simulated-touch Chromium regressions verify both teams, a defender closer to the current ball losing primary assignment when a teammate is better placed at landing, stale-spill fallback, four actions and 223 teams. Exact-head QA/Census pending.
- **0.12.81.258 main-promoted and Pages deployed:** Modular QA #45362849733 passed 2,846/2,846; dev Census #45362849673 passed all four Node/four Chromium shards on `6b6d839399699341f23a11a07cc20be4d95d2553`; QA-gated promotion advanced main to the same SHA; Pages #45364600064 succeeded. Independent main Census #45364610881 attempt 1 timed out only in `lan_render_hosted_browser_qa.py` (browser shard 0, 45-second wait); failed-job-only attempt 2 is still running. Hosted-pages smoke and all other shards passed.
- Main protection #87 remains open; REST reports `protected=false`. Physical #48 and Render drift #86 remain open. No physical-device or authenticated-online-hosting claim.

## Next smallest action
Inspect .259 exact-head Modular QA and Full Regression Census; fix only confirmed failures. Promote only the exact green dev head through the existing QA-gated pipeline, then verify Pages deployment, independent main Census and hosted bytes. Recheck the .258 main-Census retry.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Do not read/edit another agent's checkpoint or claim unverified art, device or hosting acceptance.

## Evidence
- .258 dev Modular QA and Full Regression Census passed; .258 QA-gated promotion and Pages deployment succeeded.
- .258 independent main Census has a single `lan_render_hosted_browser_qa.py` timeout on attempt 1; attempt 2 remains in progress.
- .259 gameplay source and focused Node/desktop/simulated-touch regressions committed on dev; exact-head CI pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
