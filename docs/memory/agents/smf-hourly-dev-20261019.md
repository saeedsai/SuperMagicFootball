# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .145 AI-CUTBACK-UNPRESSURED-RELEASE-01: a safe byline cutback can be released without waiting for an immediate defender within 230 units. Shot selection stays first; early-release probability scales with CPU pass tendency and team pass tactic. The cutback still requires an available central runner behind the carrier and a clear projected lane/collection pocket. Two focused driveAI integration regressions added; exact-head QA pending.
- .144 AI-CUTBACK-PASS-01: Modular QA 2,591/2,591 and Keeper integrity passed. Full Census preflight, preview, all four Node shards and three Chromium shards passed; browser shard 0's historical lan_auto_two_browser_qa.py timed out once (62 pass, 1 fail); failed-job-only retry is running.
- .143 is the latest Pages-verified main release. Its exact-head Census passed all four Node and Chromium shards on retry; Modular QA, QA-gated promotion, Pages deployment, main Census and hosted-byte smoke passed.

## Next smallest action
Run the .145 focused Node tests, Modular QA, and exact-head Full Regression Census (four Node + four Chromium shards); repair confirmed failures. Permit promotion only through the existing exact-head QA-gated main pipeline, then independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
Dev before .145: 46092dd1c93613aa1711dd4724315f5510bb0626. Main: 714ba545669ae8d86ba6eacd6ec43bf9044fb2bc. .144 Modular QA 44870448751 success; Keeper integrity 44870448775 success; Census 44870448797 failed only browser shard 0 on lan_auto_two_browser_qa.py (62 pass, 1 timeout); failed-job-only retry requested. Branch protection #87, Render drift #86 and physical two-phone acceptance #48 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.