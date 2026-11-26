# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.317 — FIREBALL-READY-TARGET-RESOLVER-PARITY-02:** exact-head .316 Full Regression Census #45747415272 exposed one real production mismatch in browser shard 2: reactToFireballTrick handed the wind-up to the next ready defender, but tryMagicTrick still selected the nearer invulnerable opponent from the legacy rival pool. The browser case showed the second defender at z=24.38 and countered=false. .317 applies the same ready-target filter to Fireball/Freeze/Bat as to Scream; Lightning and unrelated tricks retain their dedicated/legacy pools.
- .316 Modular QA #45747415256 passed; .316 Census #45747415272 failed only magic_fireball_ai_counter_browser_qa.py (71 passed, 1 failed in browser shard 2). Other Node/Chromium shards, preflight and preview passed.
- .314 dev Census #45739022812 and QA #45739022679 passed; Pages #45740394957 deployed exact main SHA e1720386be42b69c068afa0c193148f21abaefe7. Independent main Census #45740402228 completed successfully on attempt 2.
- Exact base before .317: dev d2df56c7e9f49c2e296e97a05a628feebd3b3e0e; main e1720386be42b69c068afa0c193148f21abaefe7; dev six commits ahead, zero behind.

## Next smallest action
Inspect exact-head .317 Modular QA and Full Regression Census. Fix any confirmed failure, then continue an independent gameplay increment on dev. Only a green exact head may promote through the existing QA-gated main pipeline; verify main Census, Pages deployment and hosted bytes independently.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Studio art requires provenance and game-scale QA. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- .317: src/modules/engine.js; tests/magic_fireball_ai_counter.test.cjs; existing tests/magic_fireball_ai_counter_browser_qa.py; release metadata, service-worker cache and master backlog.
- .316 failed exact-head Census: #45747415272, browser shard 2; failure log confirms resolver selected the invulnerable nearest defender despite the AI handoff.
- .316 exact-head Modular QA: #45747415256 passed.
- .314: dev Census #45739022812 passed; Pages #45740394957 succeeded; main Census #45740402228 succeeded on attempt 2.

## Cleanup
Keep this checkpoint below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
