# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-09

## Mission
Existing dev only. Preserve 223 teams, 2676 players, six formations, four actions, saves/offline, Career/Cup ten slots, SD09. No routine LAN/P2P work.

## Current checkpoint
- Chromium Breath ownership regression now asserts actual live `matchState === 'play'` and one field canvas before testing four unique buttons, host/guest seat switching, selected-player identity, teammates/opponents, CPU and Studio exclusion. Test change commit dbc1e1c7be9691b61f8edcbb28dd5c76a6a719fa.
- Test-only; candidate version remains 0.12.81.67. GitHub connector accepted commit. Executable test NOT run; local git clone DNS fails. Exact-head Census/Modular QA, main promotion and Pages hosted bytes unverified.
- Before change: dev 43 ahead / 0 behind main 828a4549327d14ffa592ad05ca94732391a9d988. Open #48 two-phone, #86 Render auto-deploy, #87 branch protection.

## Next smallest action
1. Execute focused Breath Node and desktop/touch Chromium QA; repair any failure.
2. Execute four Node/four Chromium shards and Modular QA on exact dev head.
3. Require enforced branch protection and exact green head before promotion and hosted byte checks.
4. Advance Player Studio, counterable four-action Magic Tricks, eight-view existing-player art, goalkeeper and Career.
5. Investigate #86 Render trigger drift independently; leave #48 open pending physical acceptance.

## Ownership and exclusions
Own checkpoint only; no new branches, main writes, force-push or other agents' memory.

## Evidence
GitHub accepted browser test commit; no executable pass claimed.

## Cleanup
Do not report unrun tests or hosted checks as passing.
