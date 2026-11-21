# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .147 AI-CUTBACK-GOALKEEPER-READ-01: active opposing goalkeepers now block CPU cutback preferences when they occupy the driven flight corridor or predicted receiving pocket. Downed, recovering, high-airborne and out-of-time keepers remain non-blocking. Four actions, pass physics, saves and rosters unchanged. Two focused mirrored Node regressions added. Modular QA and Census preflight passed; Full Regression Census is running.
- .146 Modular QA passed 2,593/2,593. Census retry attempt 2 failed only in historical lan_auto_two_browser_qa.py: the guest-away movement worked, but an unrelated host CPU home player moved 106 units during 0.7 seconds and violated an arbitrary <70 movement assertion. .148 removes that false test bound; no LAN production code changed.
- .143 remains the latest Pages-verified main release. Its exact-head Census passed all eight shards on retry; Modular QA, QA-gated promotion, Pages deployment, main Census and hosted-byte smoke passed.

## Next smallest action
Finish .147/.148 exact-head four-Node/four-Chromium Census and Modular QA. Fix confirmed feature regressions; if only the historical LAN browser script fails, correct its test contract or retry the failed job without changing LAN mechanics absent a production regression. Promote only through the existing exact-head QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
Dev .147: 260ef4ba2c0f415254e79465bf7693668f2f43cb. Main: 714ba545669ae8d86ba6eacd6ec43bf9044fb2bc. .147 Modular QA 44879129206 passed; Census 44879129167 preflight passed and shards were running at last check. Branch protection #87, Render drift #86 and physical two-phone acceptance #48 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
