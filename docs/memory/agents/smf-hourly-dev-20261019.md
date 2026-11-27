# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.371 — DRIBBLE-COUNTER-2D-FACING-READ-01: Nutmeg and Rainbow counter bonuses now require the defender's live 2D heading to point toward the carrier. Directional input wins; neutral input falls back to residual movement; legacy stat-only callers retain horizontal facing.
- Production: src/modules/dribbles.js and src/modules/engine.js; no new player state or save-schema change.
- Regressions: tests/dribble_fatigue_defence.test.cjs and tests/ai_dribble_trick_ready_threat.test.cjs; desktop/simulated-touch tests/ai_dribble_trick_ready_threat_browser_qa.py; both teams, facing-away/toward and legacy fallback.
- .370 gate repair: commit a88870dde49eab5e59f94bc7091bd93f2e94efc1 moved the clean-poke helper to GameEngine.prototype after the class and restored checkpoint identity. Modular QA #46038613272 passed; Census #46038613357 preflight/preview passed, Node shards 2/3 passed, remaining Node/Chromium shards were in progress when .371 was prepared.

## Next smallest action
Inspect .371 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then continue the next distinct football gameplay or existing-player animation improvement.

## Ownership and exclusions
Read/update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Base dev: a88870dde49eab5e59f94bc7091bd93f2e94efc1 (.370 preflight repair); main: 87e914539b2cf3e47dc1fb8e4c813decc13ae860 (.366).
- .370 Modular QA #46038613272 passed; Full Regression Census #46038613357 preflight/preview and Node shards 2/3 passed; remaining Node/Chromium shards pending at .371 preparation.
- GitHub branch API reports main.protected=false and dev.protected=false; #87 remains open.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
