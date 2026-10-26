# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26

## Mission
Deliver one bounded tested dev increment per hourly run. Keep only dev/main, never force-push or bypass CI. Preserve 223 teams/2676 players, six formations, four buttons, Career/Cup ten slots, SD09, saves/offline.

## Current checkpoint
- 0.11.2.1 P2P-004 candidate: stale rejected host-offer and guest-accept promises cannot close a newer session or overwrite status after Reset, role change or disposal. Two focused regression cases added.
- Baseline dev/main `da78ebbff2797978e2eb36e8f56b58fe2a82e4df` is certified in CI: dev Modular #40374843405, dev Full 4+4 #40374843277, main Full #40375449068, Pages #40375446757. Physical two-device LAN/P2P unverified.

## Next smallest action
1. Inspect new exact-head Modular and Full 4 Node + 4 Chromium; repair failures on dev.
2. Verify protected exact-head promotion and main/Pages byte smoke.
3. Test two physical LAN clients and private internet P2P; document TURN limitations.
4. Continue counterable four-button Magic Tricks and Player Studio.
5. Improve authored directional animations with desktop/touch visual QA.

## Ownership and exclusions
Only dev/main; sole developer. Never force-push, weaken tests, bypass permissions/security, or claim physical-device certification without evidence. Do not read or edit other agents' memory.

## Evidence
Previous green SHA `da78ebbff2797978e2eb36e8f56b58fe2a82e4df`; new P2P-004 exact-head CI pending. Local source-level race tests must be checked against GitHub Actions.

## Cleanup
No schema, roster, gameplay physics, button count, saved-game, or offline behavior changes. Continue hourly even if release is pending.
