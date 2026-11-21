# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .155 KEEPER-PARRY-SCRAMBLE-01: a successful ordinary parry shortens the keeper's next-dive cooldown by 0.12–0.30 seconds, scaled by GK Skill, GK Diving and fatigue. It never expires before the existing dive plus 340 ms get-up pose and 60 ms buffer. Clean catches keep the full cooldown.
- .154 Census repair: ability browser fixture clears transient hazards/action state; ground-trap browser fixture now calls the real post-movement `updateMagicHazards` disarm phase, accepting safe escape or an observed disarm event.

## Next smallest action
Run focused `keeper_parry_recovery.test.cjs`, hazard Node/browser tests, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards). Fix confirmed failures; promote only through the existing exact-head QA-gated pipeline.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Parent dev .154: a203e304fecc2aed76e26d90ade9ff49f4ee7344; Modular QA #44902687522 passed; Keeper integrity #44902687557 passed; Full Census #44902687541 failed only browser shards 0/1 (ability fixture and hazard disarm harness). Main .153: 550168c8ba2f56dff9c51b45e18029c0bdd6ffdd; Pages #44899003224 and main Census/hosted smoke #44899003446 passed. Main protection #87 remains unresolved; #48 and Render drift #86 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
