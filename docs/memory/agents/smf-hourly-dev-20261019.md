# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.416: KEEPER-LOW-CROSS-LIVE-TURN-ARRIVAL-01. A CPU keeper evaluating a targeted low ground cross now projects its current cross-track movement through the existing bounded Agility-limited turn when valid live steering is present. This prevents a keeper turning into the 56-unit goal-side claim lane from being rejected on stale lateral momentum, while low-Agility/turn-away keepers remain conservative. Neutral, invalid, slow and legacy movement preserve the previous reach calculation.
- Gameplay source: `src/modules/ai.js`, `keeperLowCrossClaimTarget`. Focused Node and actual-GameEngine desktop/simulated-touch Chromium regressions extend the existing low-cross claim suites.
- Candidate .415 is on dev; .416 supersedes it and requires fresh exact-head gates.

## Next smallest action
Inspect .416 Modular QA and Full Regression Census on the exact new SHA. Verify both goal directions, high/low Agility, turn-away and neutral/invalid fallback, plus existing low-cross claim/return and outfielder-arrival cases. Fix only confirmed failures without weakening assertions. Promote only through the existing QA-gated main pipeline after a green exact head; independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Run-start dev: 822bf406f95f587c1db03774bfa4298c2f94b78b (.415.1); main: 6b488ae92b30d08de33bc5f9bc4ce10771c738d3 (.414).
- .415.1 Modular QA #46181570248 passed; Full Regression Census #46181570155 passed preflight and preview, Node shards 2/3 passed, Node shards 0/1 and all four Chromium shards were still running when .416 began.
- .415 initial QA/Census #46181275976/#46181276019 failed only the README heading and checkpoint Agent ID release contracts; both were corrected in .415.1.
- GitHub REST reports `dev.protected=false` and `main.protected=false`; #87 remains open. #86, #48, #3, #10 and #12 remain open.
- No local Node/Chromium execution or physical-device testing was performed in this run. .416 exact-head CI evidence is pending.

## Cleanup
Keep this checkpoint below 4 KiB. Leave all other agent checkpoints untouched.
