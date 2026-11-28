# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 player identities/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.418: MAGIC-TELEPORT-CPU-JUMP-COUNTER-01. CPU defenders now time the existing JUMP counter when they occupy Teleport's landing corridor but not the closer SHOOT-slide lane. Existing slide response keeps priority; a CPU jump may back up a selected human slide-lane marker. The AI retains the earned threat through the first takeoff frames so the existing resolver sees the defender airborne.
- Production source: `src/modules/engine.js`, `reactToTeleportTrick`. Teleport resolver geometry, destination, cooldown/fatigue, ball physics and the four action buttons are unchanged.
- Focused regressions: `tests/magic_teleport_ai_counter.test.cjs` and actual-GameEngine desktop/simulated-touch `tests/magic_teleport_ai_counter_browser_qa.py`.

## Next smallest action
Inspect .418 exact-head Modular QA and Full Regression Census. Verify both teams, 30/60/120 Hz, all four non-Rookie difficulties, slide priority, JUMP-only corridor, selected-human backup, takeoff retention and real resolver counter. Fix only confirmed failures. Promote only through the existing QA-gated main pipeline after a green exact dev head; independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Run-start .417 dev SHA: `1aa906b1e5358fc7759bc5ec6932572fc8ca7bb2`; main had been promoted to the same SHA through the existing pipeline.
- .417 Modular QA #46186425809 passed. Full Regression Census #46186425811 passed preflight, preview, all four Node and all four Chromium shards, and `promote-dev-to-main`.
- .417 Pages deployment #46187351140 succeeded. Independent main Census #46187358199 was running at feature start.
- GitHub REST reported `dev.protected=false` and `main.protected=false`; #87 remains open. #86, #48, #3, #10 and #12 remain open.
- .418 exact SHA and CI evidence are recorded in the new GitHub commit and its exact-head Actions runs.

## Cleanup
Keep this checkpoint below 4 KiB. Leave all other agent checkpoints untouched.
