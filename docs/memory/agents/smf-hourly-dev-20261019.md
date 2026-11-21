# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .139 AI-BURST-TRICK-CLOSE-SLIDE-01: close CPU defenders use the existing grounded SHOOT-slide counter for Fireball, Freeze and Bat, timed in the final 160 ms of the visible wind-up after the selected difficulty's reaction delay. Farther defenders keep JUMP; Rookie remains too slow; cooldown-blocked slides fall back to JUMP. No new action, save field or trick cost.
- .138 HIDE-BALL-CPU-PASS-POKE-01 is promoted and Pages-deployed. Exact dev push Census passed all four Node and all four Chromium shards; Modular QA and QA-gated promotion passed. Main Pages deployment and hosted-pages byte smoke passed.
- Separate main workflow-dispatch Census 44855381011 passed preflight and hosted smoke but failed preview-smoke during Chromium installation; browser shard 0 was still running at last inspection. Retry the failed job; do not confuse it with the successful dev push Census.
- Base dev/main head before .139: b0ce79bb6de020a589305764dc00fad28d963d74.

## Next smallest action
Run exact-head .139 focused Node, Modular QA and Full Regression Census (four Node + four Chromium shards); fix confirmed failures, then permit only the existing QA-gated promotion. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
.138 dev Census 44854407338: preflight, all eight regression shards and preview smoke passed; promotion job passed. Modular QA 44854407351 passed. Pages deployment 44855381064 passed. Main hosted-pages smoke 44855381011 passed; its separate preview-smoke Chromium installation failure is not yet retried.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.