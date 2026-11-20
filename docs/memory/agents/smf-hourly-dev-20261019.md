# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-20

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .131 KEEPER-SAFE-PARRY-LANE-01: a deflected keeper save now chooses the clearer short rebound corridor away from nearby active attackers; no/ambiguous pressure keeps the shot-angle fallback. Catch threshold and outward speed unchanged. Focused production-helper regression added.
- .130 exact-head Census: preflight, preview smoke, all four Node shards and three of four Chromium shards passed. One browser failure was a bad assertion capture in `magic_wind_trick_browser_qa.py`: it read `windTrickFx` after setting it to zero. Corrected capture order in .131. Modular QA and Keeper Save Event Integrity passed; auxiliary Concept Hero QA failed on missing `ws` dependency and is outside owner scope.
- Main protection #87, Render drift #86 and physical two-phone acceptance #48 remain open. Breath .66–.68 is complete.

## Next smallest action
Run exact-head .131 Full Regression Census and Modular QA; fix any remaining confirmed failures. Then continue goalkeeper save/rebound behavior and responsive gameplay.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN work or other agents' private checkpoints.

## Evidence
.131 production keeper parry behavior, focused regression and .130 Wind browser-contract repair committed on the existing dev branch. Direct extracted-helper smoke passed six scenarios. Exact-head Node/Chromium Census and hosted release remain pending.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
