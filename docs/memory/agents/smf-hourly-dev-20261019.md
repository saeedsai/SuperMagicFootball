# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.368 — AI-LOOSE-BALL-TURN-ARRIVAL-READ-01: trusted low loose-ball landing reads now project defender momentum through the existing Agility-limited turn response when finite live steering exists. Neutral/invalid steering retains the prior linear projection and cross-track cost.
- Production: `src/modules/ai.js`. No new player state, save-schema or roster change.
- Regressions: `tests/ai_loose_ball_second_ball_cover.test.cjs` and neutral/invalid fallback; desktop/simulated-touch actual-GameEngine browser QA retains the surface-drag and coordinated primary/support acceptance.
- .367 gate repair: Census #46005191109 failed only browser shard 3 because the secondary support fixture expected frictionless .18-second travel instead of Grass .986 drag. Four Node shards and browser shards 0–2 passed; Modular QA #46005191111 passed. .368 updates that fixture to the production drag integral.

- .368 first preflight #46018016059: four README title-contract failures and one overconstrained actual-engine test fixture were confirmed. The README heading now matches the tested canonical spelling; mirrored direct-helper tests replace the unstable second-player target assertion. Production AI logic is unchanged.

## Next smallest action
Inspect .368 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then continue the next distinct gameplay or existing-player animation improvement.

## Ownership and exclusions
Read/update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Base dev: 1c3538f63d4884b6a09a5de3de85338f6f9223e0; main: 87e914539b2cf3e47dc1fb8e4c813decc13ae860.
- Main Census #46003959995 and Pages deployment #46003949070 passed on main .366, including hosted Pages smoke.
- GitHub REST reports main.protected=false and dev.protected=false; rulesets endpoint returned [].

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
