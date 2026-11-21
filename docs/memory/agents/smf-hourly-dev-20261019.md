# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .146 AI-CUTBACK-UNPRESSURED-RELEASE-01 QA repair: early safe byline cutbacks retain shot-first order and pass-tendency/tactical weighting. Integration fixtures now use actual 2,260.8-unit match-pitch bounds; shot random draw is explicitly declined before the early-cutback draw. README heading/package/About/cache alignment restored. Exact-head QA pending.
- .145 first preflight and Modular QA failed five tests: one match-scale fixture used 900-unit helper coordinates, and four release contracts caught README heading/version mismatch. .145 not promoted.
- .144 Modular QA 2,591/2,591 and Keeper integrity passed, but Full Census failed on both attempts only in historical lan_auto_two_browser_qa.py (62 pass, 1 timeout). No LAN production code changed.
- .143 is the latest Pages-verified main release. Its exact-head Census passed all eight shards on retry; Modular QA, QA-gated promotion, Pages deployment, main Census and hosted-byte smoke passed.

## Next smallest action
Run .146 focused Node tests, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards); repair confirmed failures. Permit promotion only through the existing exact-head QA-gated main pipeline, then independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
Dev before .146: 8a1c663e520f1baf17ab9a44c67b525ad2d1659c. Main: 714ba545669ae8d86ba6eacd6ec43bf9044fb2bc. .145 Modular QA 44874590448 and Census 44874590489 both failed the same five Node contracts; Keeper integrity 44874590492 was running at last check. .144 retry failed historical LAN browser timeout. Branch protection #87, Render drift #86 and physical two-phone acceptance #48 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.