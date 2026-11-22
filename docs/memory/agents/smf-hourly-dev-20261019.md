# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .170 KEEPER-PARRY-MOVEMENT-READ-01: CPU goalkeeper parry-side selection scores current positions and bounded 0.24/0.48-second attacker projections (150-unit per-axis cap). A runner closing into the nominal shot-angle corridor can cause the keeper to redirect toward the materially clearer side. Catch threshold, rebound speed, ball physics, four controls and saves remain unchanged.
- Focused Node regressions cover both goals, legacy velocity fallback and stationary fallback. New real-engine Chromium acceptance covers desktop/simulated touch, mirrored keeper sides and actual dive-parry direction with a moving attacker.
- .169 Modular QA #44965531928 passed 2,672 Node tests. Full Census #44965531905 passed preflight, preview, all four Node shards and three Chromium shards; browser shard 1 failed only existing lan_auto_two_browser_qa.py 10-second Playwright wait. Failed-job-only retry attempt 2 is running.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual art approval or physical-device acceptance claimed.

## Evidence
Base .169 dev SHA: `722d9bac1e6f41c1c078a1ce33d76d198e84ee82`; main SHA: `adb5c690d9d5ef44335eaa98226b12e011bf489f`. #87 remains unresolved; branch-protection endpoint access was denied this run. #48 and #86 remain open. Graphics issue #10 remains owner/graphics acceptance scope; no art changed. Authenticated online hosting is not live without owner resources.

## Next smallest action
Validate .170 on exact-head Modular QA and four Node/four Chromium Census; fix only confirmed failures, then continue an unblocked gameplay/goalkeeper improvement. Do not repeat Breath or already-covered trick counters.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
