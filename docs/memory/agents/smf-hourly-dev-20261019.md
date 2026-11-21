# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .166 AI-FIRST-TOUCH-RUNUP-SLIDE-01: a CPU primary presser may commit the existing SHOOT slide from 74–98 units only during a pressured grounded first-touch window, with a fast aligned run-up and positive closing speed. Chance scales by AI tackle/anticipation and tactical pressing; normal close-range poke, human input and unpressured receptions unchanged. Mirrored helper/engine Node regressions and desktop/simulated-touch Chromium acceptance added. Exact-head QA pending.
- .165 AI-FIRST-TOUCH-DEFENSIVE-CONTEST-01 is main-promoted: Modular QA #44950445908 (2,657 Node tests), all four Node/four Chromium Census shards #44950445899, QA-gated promotion, Pages #44951270005 and main Census/hosted smoke #44951269959 passed.

## Next smallest action
Inspect exact-head .166 Modular QA and Full Regression Census; fix confirmed failures, then continue an independent gameplay/goalkeeper improvement. Do not repeat Breath or already-covered trick counters.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Base dev/main SHA: `7abd8ba0166fb9b7748ba5da0c3420b05a893622`. .165 main and dev now match. Main protection #87 remains unresolved and integration cannot read its admin-only endpoint. Physical two-phone acceptance #48 and Render drift #86 remain open. No visual art approval or physical-device acceptance claimed.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
