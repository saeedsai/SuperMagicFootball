# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25 16:04 CET

## Mission
Continue one bounded feature each run on existing dev regardless of pending CI/release. Only dev/main, no security bypass or force-push.

## Current checkpoint
Run-start dev `bed3877f2f9d3a2f0bd2e68b5ccbb8ea961ac338`, main `249f6fe4e118bc09390cb1694e82d45b7381f689` (10 ahead). New LAN companion-server auto room discovery and host approval are on dev; local server requires `npm install && npm run serve:lan` and shared LAN URL. Pages still manual. Server-only HTTP allowlist + realpath containment fix prepared. Candidate About 0.9.41.9; last documented certified main 0.9.41.8. Preserve 223 teams/2676 players, six formations, four buttons, ten slots, SD09 and saves/offline.

## Next smallest action
Diagnose exact-head CI; fix legacy manual LAN lobby and README contract; run full 4 Node+4 Chromium and Modular QA. Then physical LAN/gameplay/graphics QA and protected promotion.

## Ownership and exclusions
Only sole developer writes this checkpoint; never read other agents' private memory.

## Evidence
Focused Node 22 policy smoke: 2/2 PASS (public asset routes and private/traversal rejects). PR #50 Modular #40205129067 and Full #40205129176 failed 3/751 Node tests (manual lobby UI and README banner). Latest exact-head CI and real two-client play unverified. Container git clone blocked by DNS; GitHub connector writes available.

## Cleanup
Continue hourly development, test and repair blockers; no uncertified deployment.
