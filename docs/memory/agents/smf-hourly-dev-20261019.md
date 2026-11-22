# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .173 AI-LOOSE-BALL-SECOND-BALL-COVER-01: on descending, unowned, non-shot aerial balls, the second CPU presser protects a bounded goal-side landing point while the primary continues to the live ball. Uses existing 500 gravity, capped horizontal projection, pitch bounds and fail-closed state checks. No ball physics, controls, saves or rosters changed.
- Added four focused Node helper/engine regressions and a desktop/simulated-touch Chromium acceptance script. Exact-head Modular QA and four-Node/four-Chromium Census for .173 are pending.
- Prior .172 Modular QA #44980500409 passed (exact SHA 4e1bfe25ae5a8f6d28231e8578bb7c0953ecfdea). Its Full Regression Census #44980500415 passed preflight, preview and Node shards 2/3; Node 0/1 and all four browser shards were in progress when .173 began. Recheck its final status, but do not promote stale .172 after dev advances.
- Main ancestry recovery: .172 merge commit includes main's accidental test-only commit `3741d2ee3b5978435aee5abc41228e10d35dbc39` as second parent. Dev was 37 ahead and 0 behind at start of .173. Main remains at the incident commit until exact-head QA-gated fast-forward; no main write, force-push or rewrite.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual art approval or physical-device acceptance claimed.

## Evidence
- Latest fully Pages-verified release remains .165. .170 was main-promoted but Pages/hosted-byte verification was not independently observed.
- #87 remains open; #48 physical two-phone acceptance remains open; #86 Render commit-trigger drift remains open. Graphics issue #10 remains owner/graphics acceptance scope.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .173; fix only confirmed failures, then verify QA-gated promotion, Pages deployment, main Census and hosted-byte smoke separately. Continue an independent player-facing gameplay increment.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
