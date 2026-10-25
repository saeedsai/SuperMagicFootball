# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25 16:04 CET

## Mission
Continue bounded dev increments despite CI/release; only dev/main. Never bypass safety or force-push.

## Current checkpoint
Pre-test-fix dev `cda340ed1dc7a9ecc4c86b9882bb0b2bc7d71288`, main `249f6fe4e118bc09390cb1694e82d45b7381f689`. About-only candidate 0.9.42.0: local-server auto LAN room discovery, host approval, WebRTC signaling, guest disconnect retry; Pages manual fallback. Server asset allowlist fixed; previous Modular #40205713677 green. Last documented certified main 0.9.41.8. Preserve 223 teams/2676 players, six formations, four buttons, ten slots, SD09, offline/saves.

## Next smallest action
Check exact-head Modular and Full 4 Node+4 Chromium after test repair. Then real two-device LAN, graphics QA, protected main promotion and Pages byte smoke.

## Ownership and exclusions
Only sole developer edits this checkpoint; no other agents' private memory.

## Evidence
Candidate Modular #40205818761 failed 3/755 Node tests: three historical SW module-adjacency assertions omitted newly precached auto modules. Updated SW assertions to require both modules while retaining original fixture expectations. Focused source regex checks passed in this run; full CI not yet certified. Container git clone blocked by DNS; GitHub connector works.

## Cleanup
Continue hourly dev, diagnose blockers; no unverified release.
