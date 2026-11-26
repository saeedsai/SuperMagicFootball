# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.316 — FIREBALL-READY-DEFENDER-PARITY-01:** CPU Fireball/Freeze/Bat reactions now use the resolver's ready-defender eligibility. Invulnerable, downed, shot-impact pending/knocked-down/rising, hurt-recovering, invalid-height/coordinate and early non-dodge-height JUMP opponents no longer consume the response; the next active teammate can react with existing JUMP or close SHOOT-slide.
- .316 also repairs two confirmed .315 browser acceptance mismatches: the Scream handoff test now advances actual jump physics to counter height before casting, and invalid-height Scream targets correctly expect no hit when no valid target exists.
- Exact-head .316 Modular QA and Full Regression Census must be inspected before certification claims.
- **0.12.81.315:** Modular QA #45741279033 passed 2,931/2,931; Full Regression Census #45741278698 failed browser shard 2 (Scream handoff test stopped at jump initiation before the jump reached 20 height) and shard 3 (invalid-height target incorrectly expected a .32 stun despite being excluded). These are confirmed browser-fixture timing/expectation failures; the production Node suite passed.
- **0.12.81.314:** dev Census #45739022812 passed all four Node and four Chromium shards; QA-gated promotion succeeded. Pages #45740394957 deployed the same SHA.
- .314 main Census #45740402228 failed only lan_auto_two_browser_qa.py in browser shard 1 with a 10-second Playwright wait timeout; hosted smoke and all other jobs passed. A failed-job-only retry is appropriate to check whether the timeout is transient.
- Current base before .316: dev bdb287b22b30ca77cbebe37ebe1a511fdabc1cff; main e1720386be42b69c068afa0c193148f21abaefe7. Main protection #87 remains unresolved; the connected GitHub app returns 403 for the branch-protection endpoint.

## Next smallest action
Inspect exact-head .316 Modular QA and Full Regression Census (four Node plus four Chromium shards). Fix confirmed failures; only a green exact head may proceed through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes, then continue the next unblocked gameplay backlog item.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Studio art requires provenance and game-scale QA. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- .316: src/modules/engine.js; magic_fireball_ai_counter.test.cjs; magic_fireball_ai_counter_browser_qa.py; Scream browser fixture corrections.
- .315 failed exact-head Census: #45741278698, browser shards 2 and 3; exact-head Modular QA #45741279033 passed 2,931/2,931.
- .314: dev Census #45739022812 passed; Pages #45740394957 succeeded; main Census #45740402228 had one LAN browser timeout.

## Cleanup
Keep this checkpoint below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
