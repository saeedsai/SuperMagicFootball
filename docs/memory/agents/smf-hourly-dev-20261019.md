# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .176 AI-PRESSER-READINESS-01: CPU pressing/support assignment now skips high airborne players, shot-down/get-up states, and active slide/hurt or impact-recovery windows. Closest eligible grounded player presses; next eligible teammate covers. Legacy records without z remain eligible. No physics, speed, tackle strength, four actions, saves or rosters changed.
- Focused Node and real-engine desktop/simulated-touch Chromium regressions added for both team directions; exact-head .176 CI has not run yet.
- .175 was promoted to main: Modular QA #44984100120 passed 2,693/2,693 Node tests; Full Regression Census #44984100131 passed preflight, preview, all four Node and all four Chromium shards; QA-gated promotion succeeded.
- .175 Pages deployment and independent main hosted-byte smoke are not verified in this run. Latest Pages-verified release remains .172 based on the recorded deployment and main smoke evidence.
- #87 main protection remains unresolved; #48 physical two-phone acceptance, #86 Render drift and #10 graphics lock/owner acceptance remain open.

## Next smallest action
Verify .176 exact-head Modular QA and Full Regression Census; fix only confirmed failures. Then continue with a distinct attacking/defensive transition improvement rather than repeating loose-ball cover.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual approval or physical-device acceptance claimed.

## Evidence
- .175 exact head/main: `9da628fe6771800e27e616246062fef9c366da76`; main and dev were identical before .176 work.
- .175 Modular QA #44984100120: 2,693 passed, 0 failed.
- .175 Full Regression Census #44984100131: preflight, preview, four Node shards, four Chromium shards and QA-gated promotion passed; hosted-pages-smoke was skipped in the dev run.
- Render broker source is unchanged by this increment.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
