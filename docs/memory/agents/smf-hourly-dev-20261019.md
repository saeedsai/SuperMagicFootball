# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-09

## Mission
Existing dev only; preserve 223 teams, 2676 players, six formations, exactly four actions, saves/offline, Career/Cup ten slots and SD09. No routine LAN/P2P implementation.

## Current checkpoint
- Chromium Breath QA now checks all four **distinct** match actions (Pass/Shoot/Dribble/Jump), and confirms selected home human ring remains visible in one-human matches after two-human seat handoffs. Existing selected-only teammate/opponent/preview exclusions retained. Commit 11f56a8504a764c67e24ec190f98a0c0879e2ab4.
- Test-only; version remains 0.12.81.67. New Chromium QA not executed. Local git clone fails DNS for github.com. No exact-head green, main promotion, Pages verification or physical certification claimed.
- Before update: dev 41 ahead / 0 behind main 828a4549327d14ffa592ad05ca94732391a9d988. Issue #87 protection, #86 Render drift and #48 two-phone acceptance open.

## Next smallest action
1. Run focused Breath Node and desktop/touch Chromium QA on checkout-enabled runner; fix failures.
2. Run four Node and four Chromium shards plus Modular QA on exact dev head.
3. Resolve #87 branch protection before protected main promotion and hosted-byte verification.
4. Advance Player Studio, counterable four-action tricks, eight-view existing-player art, goalkeeper and Career.
5. Investigate #86 Render auto-deploy separately; keep #48 open pending physical devices.

## Ownership and exclusions
Only own checkpoint changed; no main write, new branch or force-push.

## Evidence
GitHub accepted test commit; executable regression unverified.

## Cleanup
Do not report unrun checks as passing.
