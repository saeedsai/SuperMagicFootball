# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.403 adds WIND-MUD-READABLE-DEFENDER-SELECTION-01: CPU Wind/Mud counters now choose the nearest two ready defenders who can read the live 2D wind-up lane. Downed, hurt-recovering and turned-away teammates no longer consume both reaction slots; an in-range third defender may start the existing JUMP counter. An active SLIDE/JUMP retains its slot, and the two-defender budget is unchanged.
- Production: src/modules/engine.js; focused Node coverage in tests/magic_wind_mud_ai_counter.test.cjs; actual-GameEngine desktop/simulated-touch Chromium coverage in tests/magic_wind_mud_ai_counter_browser_qa.py.
- .402 browser Census fixture row-count correction committed as d607bb8747f593b04801b79314388218d6ff0375. The failed script expected eight rows per viewport although it creates four (two teams × two wings); all gameplay assertions remain unchanged.

## Next smallest action
- Run Modular QA and exact-head Full Regression Census on .403; inspect all four Node and four Chromium shards, repair only confirmed failures, then allow only a green exact head through the existing QA-gated main pipeline.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Run start dev/main: 5ab22f2bcc078d72bd1066d7690c1289bbda6faa.
- .402 test-fixture correction: d607bb8747f593b04801b79314388218d6ff0375.
- .403 feature commit: pending.

## Evidence
- .402 Modular QA #46133382745 passed; Census #46133382761 was in progress at feature start.
- .401 main Census #46120402664 and Pages deployment #46120396983 passed; hosted-byte smoke passed exact HTML/JS/CSS bytes.
- Local tests not run in connected-source runtime; current exact-head GitHub Actions runs are the validation evidence.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
