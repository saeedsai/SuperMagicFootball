# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .181 AI-THIRD-DEFENDER-CENTRAL-RUNNER-MARK-01: when an opponent carries within 500 field units of the defending goal, a third ready CPU outfielder can shade to a bounded goal-side point against an unmarked central runner 40–260 units ahead. The primary keeps pressing and the second defender retains existing cover; wide, retreating, already-covered and unreachable runners are rejected. Unavailable, human-controlled, assist, give-and-go and first-touch commitments are respected. No speed, tackle odds, ball physics, controls, save, roster or persistence changes.
- Added mirrored helper and real-engine Node regressions plus desktop/simulated-touch Chromium acceptance. Exact-head tests pending on .181.
- .180 is fully main-promoted and deployed: Modular QA #44999339830 passed 2,715/2,715; Full Regression Census #44999339829 passed preflight, preview, all four Node and all four Chromium shards; QA-gated promotion succeeded. Main/dev converge on f08e2b0f8c75924d29b2ce84a6a9816eed50d796; Pages #45000116322 and independent main Census/hosted-pages smoke #45000121158 passed all eight shards.
- #87 main protection remains open; the current REST protection read returned 403, so do not describe main as protected. #48 physical two-phone acceptance, #86 Render drift and #10 existing-art owner acceptance remain open. Away fixtures still use the existing player-home side presentation.

## Next smallest action
Run exact-head .181 Modular QA and Full Regression Census (four Node plus four Chromium shards); repair confirmed failures, then continue an independent player-facing increment.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private memory. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual approval or physical-device acceptance claimed.

## Evidence
- .180 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/44999339830
- .180 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/44999339829
- .180 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45000116322
- .180 main Census and hosted smoke: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45000121158
- .180 source base: f08e2b0f8c75924d29b2ce84a6a9816eed50d796

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
