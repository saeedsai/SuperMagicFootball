# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.305 — KEEPER-PARRY-RECOVERY-EXCLUSION-01:** CPU keeper parry-lane selection ignores attackers in shot-impact pending/rise and explicit shot-down/get-up recovery states. Active rebound challengers and existing parry physics remain unchanged.
- Focused Node and actual-engine desktop/simulated-touch Chromium regressions are included. Exact-head CI is pending.

## Branches and release
- Parent dev/main head: `4de12cdfd3af3eb8d70aa184157bcb63e9ab515b` (.304).
- .304 dev Census #45679038345 passed all four Node and four Chromium shards; QA-gated promotion succeeded.
- Pages deployment #45681044512 succeeded on .304; hosted-pages-smoke passed.
- Independent main Census #45681056688 passed preflight, preview and hosted smoke; two Node shards passed and remaining Node/Chromium shards were running at latest inspection.
- .305 is the new dev candidate; no promotion/deployment claim.

## Next smallest action
Run Modular QA and Full Regression Census on exact .305 HEAD. Fix confirmed failures without weakening gameplay. Only a green exact head may advance through the existing QA-gated pipeline; independently verify main Census, Pages and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .304 Modular QA #45679038246 passed 2,912/2,912 Node tests.
- .304 Full Regression Census #45679038345 passed preflight, preview, all four Node shards, all four Chromium shards and promotion.
- .304 Pages deployment #45681044512 succeeded; independent main Census #45681056688 remains in progress at latest observation.
- .305 focused tests extend `keeper_parry_lane.test.cjs` and `keeper_parry_lane_browser_qa.py`; exact-head results pending.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
