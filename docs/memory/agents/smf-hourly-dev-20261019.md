# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .167 AI-THIRD-MAN-SUPPORT-RUN-01: when the primary CPU support runner occupies one forward lane, a second CPU teammate attacks a bounded complementary lane on the opposite side. Defender movement, corridor safety and teammate crowding are projected; the second runner is a fallback support-pass/through-ball option. Mirrored helper/engine regressions and desktop/simulated-touch Chromium acceptance added. Exact-head QA pending.
- .166 AI-FIRST-TOUCH-RUNUP-SLIDE-01 remains unpromoted: Modular QA #44955699576 passed 2,662 Node tests; Census #44955699618 failed one browser fixture assertion (225 runtime picker entries versus 223 canonical built-in data teams). The fixture now accepts the established runtime range; exact 223 data remains enforced by preflight.

## Next smallest action
Verify exact-head .167 Modular QA and Full Regression Census; fix any confirmed failures, then continue with goalkeeper catch-versus-parry intelligence or source-locked existing-player graphics. Do not repeat Breath or already-covered trick counters.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Base dev SHA: `cef1794fe96a9ebeff056cc41b181205baa6654d`; main SHA: `7abd8ba0166fb9b7748ba5da0c3420b05a893622`. .165 remains the latest main-promoted release. Main protection #87 remains unresolved and the admin-only endpoint is not accessible to this integration. Physical two-phone acceptance #48 and Render drift #86 remain open. No visual art approval or physical-device acceptance claimed.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
