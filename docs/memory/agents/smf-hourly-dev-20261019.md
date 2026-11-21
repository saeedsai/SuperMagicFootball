# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .168 AI-THIRD-MAN-SUPPORT-RUN-01 null-runner repair: the optional third-man pass fallback now requires a real selected runner before reading its target. A focused real-engine regression covers the case with one primary runner and no second runner. Exact-head QA pending.
- .167 introduced the complementary second CPU support lane with defender/crowding checks and mirrored desktop/touch acceptance. Code review found the no-second-runner fallback needed the explicit guard now in .168; .167 was not promoted.
- .166 first-touch slide passed Modular QA #44955699576 (2,662 Node tests), but its Full Regression Census failed one browser fixture assertion (225 runtime picker entries versus 223 canonical built-in data teams). The fixture now accepts the established runtime range; preflight still enforces exactly 223 canonical teams.

## Next smallest action
Verify exact-head .168 Modular QA and Full Regression Census; fix any confirmed failures, then continue with goalkeeper catch-versus-parry intelligence or source-locked existing-player graphics. Do not repeat Breath or already-covered trick counters.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Base dev SHA: `f14dbfdf8d56a783700fc71af045935445e4d8b5`; main SHA: `7abd8ba0166fb9b7748ba5da0c3420b05a893622`. .165 remains the latest main-promoted release. Main protection #87 remains unresolved and the admin-only endpoint is not accessible to this integration. Physical two-phone acceptance #48 and Render drift #86 remain open. No visual art approval or physical-device acceptance claimed.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
