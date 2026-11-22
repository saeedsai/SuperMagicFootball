# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay, presentation and Career/Cup improvements while preserving four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.194 KEEPER-DISTRIBUTION-READY-RECEIVER-01: keeper throws and punts now exclude down, airborne, stunned, sliding, hurt, shot-down/get-up and impact-recovering teammates. A ready outlet is preferred; when none can receive, the existing safe open-turf clearance is used. Throw/punt speeds, pass physics, four actions, saves and data remain unchanged.
- Committed on existing dev with focused helper/real-engine Node and desktop/simulated-touch Chromium regressions. Exact-head Modular QA and four-Node/four-Chromium Census pending; do not claim release or deployment until all gates and hosted verification pass.
- .193 AI-FIRST-TOUCH-SAFE-OUTLET-01 remains in source. Its Modular QA #45032909644 passed; Census #45032909653 had preflight, preview, all Node shards and browser shards 1–3 passed, while browser shard 0 was still running when .194 began. It was superseded before promotion.
- Latest Pages-deployed release remains .192 at SHA `3a485bb41b55f62e1fa25c2a98ffde9f1d3c7df2`. Pages #45027339214 and main Census/hosted smoke #45027344864 passed.

## Next smallest action
Run exact-head Modular QA and four-Node/four-Chromium Full Regression Census for .194; repair only confirmed failures, then allow the existing QA-gated promotion and independently verify Pages and main hosted-byte smoke.

## Next five product improvements
1. Add readable CPU defensive cover against a newly won first-touch outlet, without hidden-target omniscience.
2. Improve goalkeeper return-to-line recovery after catches, punches and rebound chases.
3. Continue source-faithful existing-player eight-view Studio work with game-scale screenshots and owner review.
4. Improve Player Studio live preview and directional customization usability.
5. Deepen Career/Cup season progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or visual approval claims; no routine LAN/P2P work. #48 stays open; #87 protection and #86 Render drift remain unresolved.

## Evidence
- .193 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45032909644
- .193 Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45032909653
- .192 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45027339214
- .192 main Census/hosted smoke: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45027344864

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
