# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .177 AI-LOFTED-PASS-COVER-01: the second CPU defender now screens the predicted reception corridor of a targeted lofted/cross/long pass while the primary keeps pressing the live ball. It requires a fresh reachable trajectory and an available grounded receiver; low passes retain their existing helper. No pass physics, four actions, saves or rosters changed.
- Added mirrored helper/engine Node regressions and actual-engine desktop/simulated-touch Chromium acceptance.
- .176 exact-head Modular QA #44988857927 and Full Regression Census #44988857953 failed two release-contract tests (2,694/2,696 Node passed): stale policy title and missing stable service-worker cache marker. Corrected in .177.
- .175 was promoted to main. Pages deployment #44984852753 and hosted-pages smoke passed; main Census #44984857578 failed only historical lan_auto_two_browser_qa.py (64 pass, one 10-second timeout); failed-job-only retry requested.
- #87 remains unresolved; #48 physical two-phone acceptance, #86 Render drift and #10 graphics owner acceptance remain open.

## Next smallest action
Verify .177 exact-head Modular QA and all four Node/four Chromium Census shards. Fix only confirmed failures, then continue with a distinct gameplay improvement.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual approval or physical-device acceptance claimed.

## Evidence
- .176 exact-head run #44988857927: 2,694/2,696 Node passed; two versioning assertions failed.
- .176 Full Regression Census #44988857953: preflight Node failed on the same two release-contract assertions; browser shards were skipped.
- .175 exact head/main: `9da628fe6771800e27e616246062fef9c366da76`; Pages deployment and hosted-pages smoke passed.
- Render broker source is unchanged by .177.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
