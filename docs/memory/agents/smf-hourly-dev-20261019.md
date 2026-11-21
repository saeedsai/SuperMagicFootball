# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .147 AI-CUTBACK-GOALKEEPER-READ-01: active opposing goalkeepers now block CPU cutback preferences when they occupy the driven flight corridor or predicted receiving pocket. Downed, recovering, high-airborne and out-of-time keepers remain non-blocking. Four actions, pass physics, saves and rosters unchanged. Two focused mirrored Node regressions added; exact-head QA pending.
- .146 AI-CUTBACK-UNPRESSURED-RELEASE-01: Modular QA passed 2,593/2,593. Census run 44875156672 passed preflight, preview, all four Node shards and Chromium shards 1–3; browser shard 0 failed only historical lan_auto_two_browser_qa.py (62 passed, one 10-second Playwright wait timeout). Failed-job-only retry attempt 2 requested; no LAN production code changed; .146 not promoted.
- .143 is the latest Pages-verified main release. Its exact-head Census passed all eight shards on retry; Modular QA, QA-gated promotion, Pages deployment, main Census and hosted-byte smoke passed.

## Next smallest action
Run .147 focused cutback Node tests, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards); fix confirmed failures. If the only Census failure is the historical LAN browser timeout, retry only that failed job and do not modify LAN production code absent a confirmed product regression. Promote only through the existing exact-head QA-gated main pipeline, then independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
Dev before .147: ae09405043380794d026235645486a6b648eb967. Main: 714ba545669ae8d86ba6eacd6ec43bf9044fb2bc. .146 Modular QA 44875156628 passed; Census 44875156672 failed only browser shard 0's lan_auto_two_browser_qa.py timeout on attempt 1; failed-job-only attempt 2 requested. Branch protection #87, Render drift #86 and physical two-phone acceptance #48 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
