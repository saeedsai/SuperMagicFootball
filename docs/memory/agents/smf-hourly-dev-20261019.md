# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
Updated: 2026-11-27

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.370 — AI-CLEAN-POKE-IMMEDIATE-RECOVERY-01: after a CPU wins a clean ball-only short PASS poke or Pass/Shoot slide, stale AI assist/pursuit targets are cleared and the next AI decision is triggered immediately. Selected human-controlled defenders retain their state.
- Production: src/modules/engine.js; no new player state or save-schema change.
- Regressions: tests/human_exposed_ball_slide.test.cjs and actual-GameEngine desktop/simulated-touch human_exposed_ball_slide_browser_qa.py; both teams, poke/slide, CPU teammate and selected-human fallback.
- .369 Full Regression Census #46032851799 exposed one confirmed browser-fixture omission: keeper_outlet_lane_browser_qa.py defined turnLane but never populated turnRows. .370 invokes its mirrored low/high/neutral cases; production keeper code is unchanged.
- First .370 exact-head QA failed Node preflight because the helper was nested inside tackle(); the follow-up moved it to class scope. The same fixture repair had also placed turnRows.push inside a receiverTurnRows object literal; that call is now before the object. Fresh exact-head gates pending.

## Next smallest action
Inspect .370 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then continue the next distinct football gameplay or existing-player animation improvement.

## Ownership and exclusions
Read/update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Base dev: 80463893e1252370ba4f0c890e6b2ac446269d05 (.369); main: 87e914539b2cf3e47dc1fb8e4c813decc13ae860 (.366).
- .369 Modular QA #46032851989 passed. Full Census #46032851799: preflight, preview and four Node shards passed; browser shard 0 failed the missing turnRows fixture invocation, browser shards 1/2 passed and shard 3 was running at inspection.
- GitHub branch API reports main.protected=false and dev.protected=false; #87 remains open.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
