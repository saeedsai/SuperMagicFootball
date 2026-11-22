# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .172 KEEPER-OUTLET-CORRIDOR-MARGIN-01: CPU keeper short throws, long clearances and low DRIBBLE rollouts now rank already-clear outlets by predicted receiver pressure plus residual flight-corridor clearance. Marginally clear lanes are down-ranked against wider safe lanes; thresholds, throw/roll speeds and saves unchanged.
- .171 exact-head Modular QA #44975253748 and Full Regression Census #44975253844 failed five stale keeper test contracts (2,672 passed, 5 failed). Updated two VM fixtures to load the production keeperOutletLane helper/current method signature and two scoring fixtures to pass the current lane result; updated rollout source assertion. .171 was not certified.
- Focused production-helper smoke verified near endpoint pressure and marginal-vs-open corridor ranking. Full .172 Node/Chromium, Modular QA and four-Node/four-Chromium Census are pending.
- Main ancestry incident: accidental main-only test commit `3741d2ee3b5978435aee5abc41228e10d35dbc39` is now a second parent of the .172 dev merge commit. The dev tree keeps the expanded test. Main remains unchanged at the incident commit until exact-head QA-gated promotion; no main writes, force-push or rewrite.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual art approval or physical-device acceptance claimed.

## Evidence
- Latest fully Pages-verified release remains .165. .170 was main-promoted but Pages/hosted-byte verification was not independently observed.
- #87 remains open; #48 physical two-phone acceptance remains open; #86 Render commit-trigger drift remains open. Graphics issue #10 remains owner/graphics acceptance scope.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .172; fix only confirmed failures, then verify QA-gated promotion, Pages deployment, main Census and hosted-byte smoke separately. Continue an independent player-facing gameplay increment.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
