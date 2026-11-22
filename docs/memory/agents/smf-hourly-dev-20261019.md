# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .174 AI-LOOSE-BALL-SECOND-BALL-COVER-01 correction: removed an unnecessary minimum horizontal-separation rejection. The second CPU presser now protects the bounded goal-side landing point on both moving and near-vertical descending loose balls while the primary continues to the ball.
- .173 exact-head Modular QA #44981497721 failed one new edge-clamp case (2,690/2,691 passed); a valid landing close to the ball's x/y was rejected. .174 removes that guard and adds a vertical-drop Node/browser scenario. .173 was not certified.
- .172 Modular QA #44980500409 and dev Full Regression Census #44980500415 passed. Pages deployment #44981249519 succeeded on main SHA 4e1bfe25ae5a8f6d28231e8578bb7c0953ecfdea. Main Census #44981254933 was still running when .174 began.
- Main ancestry recovery remains intact: main was 4e1bfe25ae5a8f6d28231e8578bb7c0953ecfdea and dev was one commit ahead before .174. No main write, force-push or rewrite.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual art approval or physical-device acceptance claimed.

## Evidence
- Latest fully Pages-verified release remains .172 at the time of this checkpoint; #87 main protection, #48 physical two-phone acceptance, #86 Render drift and graphics issue #10 remain open.
- Render broker remains on dev with commit auto-deploy enabled; live commit is still LAN-094 (3da2f0c...), and no events were returned from 15–22 November. This candidate does not change broker files.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .174; fix only confirmed failures, then verify QA-gated promotion, Pages deployment, main Census and hosted-byte smoke separately. Continue an independent player-facing gameplay increment.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
