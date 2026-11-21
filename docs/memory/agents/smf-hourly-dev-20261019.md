# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .140 FIREBALL-SECOND-DEFENDER-READ-01: a downed or still-recovering nearest CPU defender no longer suppresses a nearby active teammate's timed Fireball/Freeze/Bat counter. A nearest defender already jumping or sliding retains the response, avoiding duplicate overcommitment. Existing range, difficulty timing, close slide window, Rookie limitation, four actions, saves and trick costs unchanged. Focused Node regressions added; exact-head QA pending.
- .139 AI-BURST-TRICK-CLOSE-SLIDE-01 is promoted and Pages-deployed. Exact dev push Census passed all four Node and all four Chromium shards on attempt 2; Modular QA passed 2,579/2,579; Keeper Save Event Integrity passed; QA-gated promotion passed; Pages deployment and hosted-pages byte smoke passed.
- Main workflow-dispatch Census .139 passed preflight, preview, hosted smoke and all four Node plus three Chromium shards; only `lan_auto_two_browser_qa.py` timed out in browser shard 0. Failed-job retry requested; this is separate from the green dev push Census.
- Base dev/main head for .140: b7da5adf2be7cdc3cd2f08a9b3a92c8dd59c687f.

## Next smallest action
Run exact-head .140 focused Node, Modular QA and Full Regression Census (four Node + four Chromium shards); fix confirmed failures, then permit only the existing QA-gated promotion. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
.139 dev Census 44856740459 attempt 2: preflight, all eight regression shards and preview smoke passed; promotion job passed. Modular QA 44856740432 passed; Keeper Save Event Integrity 44856740434 passed. Pages deployment 44858218657 passed. Main Census 44858218757 passed preflight, preview and hosted smoke plus all Node and three Chromium shards; one LAN auto-two-browser timeout remains under retry.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
