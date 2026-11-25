# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.283 — AI-DIRECT-PASS-HURT-RECOVERY-LANE-READ-01:** generic player-directed and CPU directional ground passes no longer treat an outfielder in active `hurt` recovery as a live lane interceptor or moving-receiver crowding threat. The defender becomes active again when its recovery timer reaches zero.
- Production change: `src/modules/shotfeel.js`; new Node and actual-engine desktop/simulated-touch Chromium regressions cover lane pressure, moving receiver selection, both teams, and recovered-defender countercases.
- Previous .281 is certified/promoted/deployed on main SHA `0fc6bec3e7ef134bfe66baa5bfc6f4fae812cede`; .282's exact-head Modular QA passed and its full Census is in progress at last inspection.

## Next smallest action
Inspect exact .283 push runs. Verify Modular QA, all four Node and four Chromium Census shards; fix confirmed failures, then allow only a green exact head through the existing QA-gated promotion. Independently verify main Census, Pages deployment and hosted-byte smoke. Continue with goalkeeper parry/dive readability or existing-player animation once gates are clear.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. Authenticated online hosting is not live without owner resources.

## Evidence
- Exact prior dev head: `ddb9144bd77a275ca88b62888aa3fd2e7d13651b`; .282 Modular QA #45539768621 passed. Its Census #45539768615 had preflight, preview, Node shards 0/2/3 and browser shards 0/1/2 passed; Node shard 1 and browser shard 3 were still running at inspection.
- Branch metadata before this commit: dev `ddb9144bd77a275ca88b62888aa3fd2e7d13651b`, main `0fc6bec3e7ef134bfe66baa5bfc6f4fae812cede`; main protection disabled, dev protection disabled, rulesets empty.
- No test pass or deployment claim for .283 until its exact-head runs complete.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
