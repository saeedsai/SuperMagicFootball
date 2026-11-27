# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.375 — AI-DRIBBLE-PRIMARY-SLIDE-ESCAPE-READ-01.
- CPU-controlled Dribble tricks now include a valid nearby primary defender's committed grounded slide in the existing 120 ms escape-lane projection. If the slide sweeps across the automatic exit, CPU selects the lower-risk opposite lane. Human-directed feints and ordinary/expired/retreating slide behavior remain unchanged.
- Production: `src/modules/engine.js`; focused Node and actual-GameEngine desktop/simulated-touch Chromium regressions extend `ai_dribble_trick_ready_threat`.
- Release metadata, About-only version, README, policy, service-worker cache, master backlog and this checkpoint updated. No new player state, save field, action, roster, formation or art asset.

## Next smallest action
- Run Modular QA and exact-head four-Node/four-Chromium Full Regression Census at the final dev SHA; fix confirmed failures without weakening assertions.
- Previous .374 Census #46040879890 had browser shard 3 fail only `online_account_ui_browser_qa.py` because the online service timed out. Other three browser shards and Node shards 0, 2 and 3 passed; Node shard 1 was still running at last inspection. Retry the failed browser job after the workflow finishes; no gameplay failure was established by that timeout.

## Ownership and exclusions
Read/update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Feature commit: 7e5829b91b546a8608295706a5772f10b16b2fd1.
- .375 exact-head QA/Census: pending after checkpoint integration.
- .374 Modular QA #46040879853 passed; Full Regression Census #46040879890 remained in progress at last inspection.
- Main: 87e914539b2cf3e47dc1fb8e4c813decc13ae860; branch API reports main.protected=false and dev.protected=false.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
