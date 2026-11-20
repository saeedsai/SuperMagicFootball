# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-20

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .130 PASS-POKE-MOVING-LEAD-01: ordinary PASS poke now leads a moving target by 55 ms, capped at 12 units per axis; SHOOT slide retains 85 ms / 22-unit lead. Stationary and invalid motion remain neutral. Focused tackle-lead regression updated.
- .129 exact-head Census: preflight passed (2,543/2,543 contracts), all four Node shards passed, preview smoke passed, but three historical Chromium scripts failed: `magic_wind_trick_browser_qa.py` and `tr15_wind_mud_browser_qa.py` still expected fixed 28-unit Wind push despite distance falloff; `v08197_keeper_browser_qa.py` expected recovery by .66s although novice dive animation lasts .7256s. Updated those contracts in .130. Modular QA passed.
- Main protection #87, Render drift #86 and physical two-phone acceptance #48 remain open. Breath .66–.68 is complete.

## Next smallest action
Run exact-head .130 Full Regression Census and Modular QA; fix any remaining confirmed failures. Then continue responsive ball/tackle behavior, goalkeeper catch/recovery and original existing-player animation.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN work or other agents' private checkpoints.

## Evidence
Production gameplay and focused regression changes are committed on the existing dev branch. .129 exact-head Node and Modular QA passed; three stale Chromium contracts were identified from job logs and updated. .130 exact-head CI and hosted release remain pending.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
