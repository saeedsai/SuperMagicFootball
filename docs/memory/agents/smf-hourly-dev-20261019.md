# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-28 01:02 CET

## Mission
Sole developer; continue one bounded feature on existing dev each run regardless of CI or release queue. Only dev/main; no bypass or force push. Preserve 223 teams/2676 players, six formations, four controls, Career/Cup ten slots, SD09, saves and offline.

## Current checkpoint
- Baseline dev/main `0e3ace5f5f529d025206c17c24aa67caac89e186`. Full #40600238583 and Modular #40600238397 passed for that baseline only. Main/Pages hosted bytes and physical two-client proof remain separate.
- LAN-074 candidate 0.11.4.16: host clears stale guest button edges while paused/finished (physics does not poll inputs), so resume accepts fresh Jump without duplicate held edges. Added focused LAN-074 Node test and aligned About/package/README/SW/version policy/shared memory.
- Latest dev SHA must be fetched after these commits; exact-head full CI, protected PR, Pages and real devices not yet certified.

## Next smallest action
1. Inspect exact dev head and 4 Node + 4 Chromium and Modular QA; fix red CI on dev.
2. Promote only exact fully green head via protected dev-to-main pipeline.
3. Confirm main SHA, Pages deployment and hosted HTML/JS/CSS bytes.
4. Test actual two-device LAN/P2P discovery, consent, controls, pause/resume and graphics.
5. Continue next bounded Studio, Trick or directional-art feature even if release is pending.

## Ownership and exclusions
Only own checkpoint; no other agents' memory. No new branches, force push, bypass, false deployment or device claims.

## Evidence
LAN-074 code and regression committed on dev; exact-head CI not yet observed. Earlier green runs apply only to prior SHA.

## Cleanup
Only dev/main. Keep hourly development enabled; retry blocked CI, deployment and physical acceptance.
