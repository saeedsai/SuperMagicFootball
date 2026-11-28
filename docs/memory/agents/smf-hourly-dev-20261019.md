# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.414: AI-LOFTED-PASS-RECEIVER-TURN-LEAD-01. Targeted lofted-pass cover now predicts a moving receiver through the existing bounded Agility turn; high-Agility lateral cuts shift the second defender's screen farther into the receiving lane, while low-Agility runners retain more forward momentum. Neutral/invalid/slow movement keeps the exact linear fallback.
- Gameplay source: `src/modules/ai.js`, `defensiveLoftedPassCoverTarget`. Focused Node and actual-GameEngine desktop/simulated-touch Chromium regressions added to the existing lofted-pass suites.
- Candidate changes are being integrated atomically on existing dev; exact-head Modular QA and Full Regression Census are required before promotion.

## Next smallest action
Inspect exact-head Modular QA and Full Regression Census; verify all four Node and four Chromium shards, especially mirrored high/low-Agility lofted receiver turns, actual second-defender target and unchanged primary pressure/JUMP response. Fix only confirmed failures without weakening assertions; promote only through the existing QA-gated main pipeline after a green exact head, then independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Run-start dev/main: `5e0d6d604366c31318050e1ab76d1715bfe2d6ac` (identical).
- .413 Modular QA #46164596041 passed 3,087/3,087 Node tests; Full Regression Census #46164596034 passed all preflight, preview, four Node and four Chromium jobs, including hosted-pages smoke.
- Main .413 Pages build/deploy #46165536192 and independent main Census #46165543483 passed; hosted-byte smoke passed.
- GitHub REST reports `dev.protected=false` and `main.protected=false`; #87 remains open. #86, #48, #3, #10 and #12 remain open.
- No local Node/Chromium execution or physical-device testing was performed in this run. .414 exact-head CI evidence is pending.

## Cleanup
Keep this checkpoint below 4 KiB. Leave all other agent checkpoints untouched.
