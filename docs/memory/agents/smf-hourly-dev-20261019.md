# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-09

## Mission
Existing dev only; preserve 223 teams, 2676 players, six formations, four actions, saves/offline, ten Career/Cup slots and SD09. No routine LAN/P2P work.

## Current checkpoint
- Extended actual-playable Chromium Breath ownership regression with explicit unselected teammate, opposing player and Studio-preview exclusions for each host/guest seat handoff. Four seat loops now expect 17 checks per desktop/touch run. Commit 82293d487ce202143bf03ab284533982a83a8c53.
- Test-only; candidate remains 0.12.81.67. New browser test NOT executed. Local checkout still blocked by github.com DNS; no exact-head CI, promotion, hosted smoke or device certification claimed.
- Before change: main 828a4549327d14ffa592ad05ca94732391a9d988; dev 39 ahead/0 behind. Historical Census 42497538136 failed preflight; later exact-head green not verified.

## Next smallest action
1. Execute focused Node Breath suites and desktop/touch Chromium QA on checkout-enabled runner; fix failures.
2. Verify four Node and four Chromium shards plus Modular QA for exact dev head.
3. Resolve branch protection #87 before protected main promotion and Pages byte verification.
4. Continue Player Studio, counterable four-button Magic Tricks, eight-view existing art, keeper and Career.
5. Investigate Render auto-deploy #86 independently; physical two-phone acceptance #48 stays open.

## Ownership and exclusions
Only own checkpoint changed. No main write, branch creation or force-push. No physical LAN certification.

## Evidence
GitHub accepted browser test commit 82293d4; executable regression pending.

## Cleanup
Do not report unrun tests as passed.
