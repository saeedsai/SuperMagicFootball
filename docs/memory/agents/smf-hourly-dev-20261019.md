# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-08

## Mission
Develop only on existing dev; preserve 223 teams/2676 players, six formations, four actions, offline saves, Career/Cup ten slots, SD09. No routine LAN/P2P work.

## Current checkpoint
- Added Chromium regression coverage for clone identity exclusion and temporarily missing selection/recovery during four host/guest seat handoffs in `tests/breath_local_selection_browser_qa.py` (16a4c1f). Assertions now expect 13 checks per desktop/touch run.
- This is test-only. Candidate remains 0.12.81.67. Chromium and Node tests NOT executed; no exact-head CI success or promotion claimed.
- GitHub connector read dev/main comparison before change: main 828a4549327d14ffa592ad05ca94732391a9d988, dev 37 ahead/0 behind at 7259c35f. CI commit-workflow lookup filters PR events and returned none; cannot infer push CI status.
- Local checkout blocked by github.com DNS failure. Last inspected historical Census 42497538136 preflight failed; subsequent exact-head gates not verified.

## Next smallest action
1. Execute focused Breath Node tests and new Chromium desktop/touch QA in a runner with checkout.
2. Fix any failing browser fixture and validate missing-selection behavior.
3. Run four Node + four Chromium shards and Modular QA on exact dev SHA.
4. Resolve branch protection #87; promote only certified exact head; verify Pages hosted bytes.
5. Advance Player Studio, counterable four-button Magic Tricks, eight-view art, keeper and Career.

## Ownership and exclusions
Only this agent checkpoint edited. Physical two-phone acceptance #48 remains open; Render auto-deploy investigation #86 remains open. Never claim device acceptance or deploy without evidence.

## Evidence
New browser regression commit 16a4c1f3751d0e99c20d13100517768d93bd484f; execution pending.
## Cleanup
No branch created, no main write, no force-push.
