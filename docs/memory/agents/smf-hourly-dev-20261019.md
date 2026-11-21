# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .161 AI-CARRY-ESCAPE-01: CPU-controlled outfield carriers beyond 320 units from goal take a short forward-diagonal movement line only when an active grounded opponent presses from ahead and one diagonal is materially safer than the direct lane. It projects defender movement, checks corridor/receiving-pocket clearance and teammate crowding. Open space, rear pressure, blocked diagonals, first-touch receptions and the final scoring zone retain normal movement. Uses existing movement and four actions; no ball physics, saves or roster changes.
- Five focused helper/engine regressions added in `tests/ai_carry_escape.test.cjs`. Exact-head Node, Chromium, Modular QA and four-Node/four-Chromium Full Regression Census pending; local Node/Chromium unavailable because github.com DNS does not resolve. Use connected GitHub CI evidence.
- .160 AI-FIRST-TOUCH-ESCAPE-01 is main-promoted: dev Census #44922978508, Modular QA #44922978496, Pages #44923750870 and independent main Census/hosted smoke #44923750923 all passed.

## Next smallest action
Inspect .161 exact-head Modular QA and Census, fix only confirmed failures, then continue with the next meaningful gameplay or existing-player visual improvement. Do not repeat Breath or already-covered counter work.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Parent dev/main SHA: `24ab9dc43c10c33b30a6f017205fdd53d5f00e43`. Main protection #87, physical two-phone acceptance #48 and Render drift #86 remain open. No visual art approval or physical-device acceptance claimed.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
