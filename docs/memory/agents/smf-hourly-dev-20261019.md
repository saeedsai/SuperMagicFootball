# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .165 AI-FIRST-TOUCH-DEFENSIVE-CONTEST-01: during a pressured low-pass reception, the second CPU defender shades into the receiver's fresh forward/diagonal first-touch route while the primary presser stays on the carrier. CPU intent is used only while live; human receivers use actual movement/facing. Requires a grounded receiver and meaningful pressure, clamps to pitch, yields to give-and-go/cutback. Runtime-only; six focused Node cases and mirrored desktop/simulated-touch Chromium acceptance added. Exact-head QA pending.
- .164 AI-PASS-RECEIVER-COVER-01 is main-promoted: Modular QA #44945383483 (2,651 Node tests), Full Census #44945383489 (all four Node/four Chromium shards), QA-gated promotion, Pages #44946274145 and main Census/hosted smoke #44946274184 passed.
- .163 AI-GOALMOUTH-GIVE-AND-GO-DEFENSIVE-SCREEN-01 remains included in .164 release history.

## Next smallest action
Inspect exact-head .165 Modular QA and Full Regression Census; fix confirmed failures, then continue gameplay/goalkeeper work before any art integration without Studio provenance and game-scale visual acceptance.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Base dev/main SHA: `151e0a6e829d487a431aff3817995cccba96bdb6`. .164 Pages and main Census independently passed. Main protection #87 remains unresolved; integration cannot read its admin-only endpoint. Physical two-phone acceptance #48 and Render drift #86 remain open. No visual art approval or physical-device acceptance claimed.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
