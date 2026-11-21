# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .159 AI-GOALMOUTH-RETURN-PASS-01 completes the .158 give-and-go: once the receiver controls the square pass and the original passer reaches the reserved forward-diagonal lane, CPU returns the ball with an existing low pass if the projected corridor and receiving pocket are safe. Shot-first finishing remains; unsafe, expired or unavailable options fall back. Runtime-only intent; no save fields or new controls.
- .158 AI-GOALMOUTH-GIVE-AND-GO-01 introduced the bounded run lane after receiver control; .157 AI-GOALMOUTH-SQUARE-PASS-01 is main-promoted and Pages-verified.

## Next smallest action
Run the three focused give-and-go return-pass regressions, exact-head Modular QA and four-Node/four-Chromium Full Regression Census at .159. Fix only confirmed failures; promote only through the existing QA-gated pipeline after a green exact-head Census.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Parent dev .158: 0e39901d4807d17181d7c6ac09587fb81fd67f4b; main .157: 3573bbbd635bf05b43de3408f330e6f13afad01a. Latest Pages-verified release remains .157. Main protection #87, physical two-phone acceptance #48 and Render drift #86 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
