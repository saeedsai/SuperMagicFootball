# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .141 AI-SUPPORT-THROUGH-BALL-01: CPU carriers can lead an accelerating support runner into open space before the runner reaches the diagonal lane. Uses actual moveVX/moveVY, a bounded 48–100-unit lead, mirrored attack direction, and rejects blocked flight corridors or crowded reception pockets. Existing arrived-runner support pass and ordinary receiver ranking remain fallbacks. Four actions, pass speed, saves and rosters unchanged. Focused Node regressions added; exact-head QA pending.
- .140 FIREBALL-SECOND-DEFENDER-READ-01: a downed or recovering nearest CPU defender yields Fireball/Freeze/Bat counterplay to the next active teammate; an already jumping/sliding nearest defender retains the response.
- .139 is the latest Pages-verified release. Exact dev Census passed all four Node and four Chromium shards on attempt 2; Modular QA passed 2,579/2,579; QA-gated promotion, Pages deployment and hosted-pages byte smoke passed.
- .140 first Census attempt: preflight, preview, all four Node shards and three Chromium shards passed; only historical `lan_auto_two_browser_qa.py` timed out in browser shard 0. Failed-job-only retry is in progress. Modular QA passed 2,581/2,581; Keeper integrity passed.
- Main head is b7da5adf2be7cdc3cd2f08a9b3a92c8dd59c687f; dev was 4c41244fa3f14eb139bec249c4088b01a93ae086 before .141.

## Next smallest action
Run focused through-ball Node tests, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards); fix confirmed failures, then permit only the existing QA-gated promotion. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
.140 Modular QA 44859671200 passed; Keeper Save Event Integrity 44859671187 passed. Census 44859671213 attempt 1 failed only `lan_auto_two_browser_qa.py`; attempt 2 is running after failed-job-only retry. .139 dev Census 44856740459 attempt 2, promotion, Pages 44858218657 and main Census 44858218757 passed.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.