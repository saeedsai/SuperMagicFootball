# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .169 AI-THIRD-MAN-LANE-ADAPTATION-01: the third CPU support runner now evaluates the nominal 176-unit opposite-side pocket plus 96- and 256-unit alternatives. It keeps the nominal lane when similarly safe, but can choose an adjacent pocket when the nominal one is marked. Defender projection, teammate occupancy, field bounds, primary-lane separation and shared-corridor rejection remain enforced.
- Focused mirrored helper tests cover adjacent-lane selection, all-pocket/corridor denial and teammate crowding. A real-engine regression verifies driveAI follows the alternate lane; desktop and simulated-touch Chromium acceptance exercises both attack directions and confirms exactly four actions.
- .168 null-runner repair is exact-head green: Modular QA #44960951949 passed 2,670 Node tests; Full Regression Census #44960951928 passed preflight, preview, all four Node and all four Chromium shards. Its QA-gated promotion moved main to the same SHA as dev. Independent .168 Pages/main Census verification remains pending because #44961835168 used the previous .165 SHA and failed browser shard 3.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual art approval or physical-device acceptance claimed.

## Evidence
Base .168 SHA: `adb5c690d9d5ef44335eaa98226b12e011bf489f` (dev and main matched before .169). Main protection #87 remains unresolved and GitHub reports `protected: false`. Physical two-phone acceptance #48 and Render commit-trigger drift #86 remain open. Existing-player graphics lock #10 must be respected. Authenticated online hosting is not live without owner resources.

## Next smallest action
Run focused Node/Chromium and exact-head Modular QA plus four Node/four Chromium Census for .169. Fix any confirmed failures, then continue with goalkeeper catch-versus-parry intelligence or the next unblocked gameplay item. Do not repeat Breath or already-covered trick counters.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
