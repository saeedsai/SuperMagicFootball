# SuperMagicFootball — smf-hourly-dev-20261019
**Updated:** 2026-11-20

## Mission
Player-facing game features, four controls, original assets, save/offline compatibility.

## Current checkpoint
- .127: Wind distance falloff adds stronger close-range push and weaker edge push; regression updated, exact-head QA pending.
- .126: High airborne defenders resist half Wind push; focused regression added, QA pending.
- .125: Mud ground slow skips defenders jumping at least 20 units; low/grounded defenders still slowed. Focused regression added; QA pending.
- .124: Wind/Mud uncountered area effects apply to all eligible nearby defenders; focused regression added, QA pending.
- .123: Wind/Mud area counters now accept active JUMP/SHOOT slide by any in-range defender, including airborne players; focused regression added, exact-head QA pending.
- .122: Wind/Mud AI cannot instantly counter a clearly rearward feint; directional regression added, exact-head QA pending.
- .121: Wind/Mud AI allows second nearest defender to independently react with JUMP; focused regression added, full QA pending.
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
