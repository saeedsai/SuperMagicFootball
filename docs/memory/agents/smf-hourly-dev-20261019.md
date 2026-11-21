# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .158 AI-GOALMOUTH-GIVE-AND-GO-01: after a CPU goalmouth square pass, the passer makes a bounded forward-diagonal run beyond the receiver into a defender-screened return lane. It starts only after the selected receiver controls the pass and clears on interception, possession change, unavailability or 1.75-second expiry. Runtime-only intent; no save fields or new controls.
- .157 AI-GOALMOUTH-SQUARE-PASS-01 is main-promoted and Pages-verified: exact-head Modular QA #44912835807, all four Node/four Chromium dev Census shards #44912835793, Pages deployment #44913633076 and independent main Census/hosted-pages smoke #44913633360 passed.

## Next smallest action
Run focused give-and-go regressions, exact-head Modular QA and four-Node/four-Chromium Full Regression Census for .158. Fix only observed failures; promote only through the existing QA-gated pipeline.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Current parent dev/main .157: 3573bbbd635bf05b43de3408f330e6f13afad01a. Main protection #87 remains unresolved; #48 physical two-phone acceptance and Render drift #86 remain open. .158 is not yet certified or deployed.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
