# SuperMagicFootball — smf-hourly-dev-20261019
**Updated:** 2026-11-20

## Mission
Player-facing game features, four controls, original assets, save/offline compatibility.

## Current checkpoint
- .120: Teleport landing can be blocked by a second jumping defender in the arrival lane; focused test added, exact-head QA pending.
- 0.12.81.119: Keeper DRIBBLE waits for recovering hurt receivers; .118: Keeper DRIBBLE roll avoids actively sliding teammates; focused test added, exact-head QA not observed.
- .117: Ground distribution ignores downed/recovering/high-airborne defenders.
- .116: Rollout predicted receiver lane; .115: moving receiver lead; .114: safe receiver; .113: outlet pressure.
- Breath .66–.68 completed. Main protection #87, Render drift #86, physical LAN #48 unresolved.

## Next smallest action
Run focused Node/Chromium and exact-head Census/Modular QA; fix confirmed failures. Then improve Magic Trick counterplay and original eight-view player animations.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art or routine LAN changes.

## Evidence
Production source change and focused regression committed. Full QA and hosted verification not observed.

## Cleanup
Keep under 4 KiB; promote only through existing QA-gated main pipeline.
