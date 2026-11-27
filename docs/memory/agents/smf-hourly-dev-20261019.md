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
- The first .375 exact-head Census preflight found a literal backslash-n before the new `release.js` note, causing JavaScript parse failures across imported modules. This was a release-metadata syntax error, not a gameplay assertion; the metadata line break is corrected in the next repair commit.
- Rerun Modular QA and exact-head four-Node/four-Chromium Full Regression Census at the repaired dev SHA. Fix confirmed failures without weakening assertions.
- Previous .374 Census #46040879890 failed browser shard 3 only because `online_account_ui_browser_qa.py` timed out waiting for the online service. Its failed-job-only retry is running; other three browser shards and all four Node shards passed. No gameplay failure was established by that timeout.

## Ownership and exclusions
Read/update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Feature commit: 7e5829b91b546a8608295706a5772f10b16b2fd1.
- .375 first Modular QA/Census: #46042892127 / #46042892209; Census preflight failed on the release.js parse error described above.
- .374 Modular QA #46040879853 passed; Census #46040879890 failed only the external online-service timeout; failed-job retry in progress.
- Main: 87e914539b2cf3e47dc1fb8e4c813decc13ae860; branch API reports main.protected=false and dev.protected=false.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
