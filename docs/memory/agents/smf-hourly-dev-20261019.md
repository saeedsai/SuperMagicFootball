# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .144 AI-CUTBACK-PASS-01: AI carriers near the attacking byline in a wide channel can select a low driven PASS to a central teammate behind the ball. The receiving point leads actual moveVX/moveVY by 100 ms (max 24 units/axis); grounded defenders projected into the flight lane or collection pocket block the preference. Human-controlled, downed, recovering and unsuitable receivers are excluded; support/through-ball/ordinary receiver fallbacks remain. Four controls, other pass types, saves and rosters unchanged. Six focused Node regressions added; exact-head QA pending.
- .143 through-ball scope repair is committed. Modular QA 44865256832 passed 2,585/2,585. Census 44865256879 attempt 1 passed preflight, preview, all four Node shards and three Chromium shards; browser shard 0 failed only historical lan_auto_two_browser_qa.py (62 pass, 1 Page.wait_for_function timeout). Failed-job-only retry attempt 2 remains in progress; no LAN production code changed.
- .139 remains latest Pages-verified release. Its exact-head dev Census, Modular QA, QA-gated promotion, Pages deployment and hosted-byte smoke passed.

## Next smallest action
Run the focused cutback Node regressions, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards); repair confirmed failures, then allow only the existing exact-head QA-gated promotion. Verify main Census, Pages deployment and hosted bytes independently.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
Dev before .144: 714ba545669ae8d86ba6eacd6ec43bf9044fb2bc. Main: b7da5adf2be7cdc3cd2f08a9b3a92c8dd59c687f. .143 Modular QA 44865256832 success; Census 44865256879 attempt 2 in progress at last check. Branch protection #87, Render drift #86 and physical two-phone acceptance #48 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.