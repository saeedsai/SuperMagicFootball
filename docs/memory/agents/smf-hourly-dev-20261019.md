# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.318 — AI-HUMAN-MARKER-BACKUP-COUNTER-01:** during Fireball/Freeze/Bat wind-ups, the selected human marker keeps control while the nearest ready CPU teammate backs them up if the human has not already started an effective JUMP/slide. The resolver now recognizes any ready defender's existing counter inside the same radius, even when the human remains the nearest hit target.
- .318 adds actual-engine desktop/simulated-touch acceptance and mirrored Node tests for both teams, all three tricks, idle-human backup and no duplicate when the human already counters.
- **0.12.81.317 — FIREBALL-READY-TARGET-RESOLVER-PARITY-02:** .316 Census #45747415272 exposed the production mismatch: CPU handed the wind-up to a ready teammate, but the resolver still selected the nearer invulnerable opponent. .317 shares the ready-target pool between AI reaction and Fireball/Freeze/Bat resolution.
- .317 Modular QA #45754005674 passed; Full Regression Census #45754005684 was still running at last observation (preflight passed, Node shards 2/3 passed, Node shards 0/1 and four Chromium shards/preview still running). Earlier .317 attempts corrected invalid-height fixture expectations and one stale source contract; the latest exact head includes those repairs.
- .316 Modular QA #45747415256 passed; .316 Census #45747415272 failed the actual-engine Fireball handoff browser test, which exposed the resolver mismatch fixed in .317.
- .314 exact dev Census #45739022812 and Modular QA #45739022679 passed; Pages #45740394957 deployed main SHA e1720386be42b69c068afa0c193148f21abaefe7; independent main Census #45740402228 succeeded on attempt 2.
- Base before .318: dev 87638e2d820ff9f6d04e7fe9508bcab4efb3f60d; main e1720386be42b69c068afa0c193148f21abaefe7.

## Next smallest action
Inspect exact-head .318 Modular QA and four-Node/four-Chromium Full Regression Census. Fix any confirmed failure; only a green exact head may promote through the existing QA-gated main pipeline. Verify main Census, Pages deployment and hosted bytes independently.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- .318: src/modules/engine.js; magic_fireball_ai_counter.test.cjs; magic_fireball_ai_counter_browser_qa.py; four focused Fireball/Freeze/Bat counter source-contract tests; release metadata and offline cache.
- .317 latest QA: Modular #45754005674 success; Census #45754005684 in progress at last check.
- .316 failure: #45747415272; resolver target mismatch confirmed in browser shard 2.
- .314: dev Census/QA passed, Pages deployment succeeded, main Census #45740402228 succeeded on attempt 2.

## Cleanup
Keep this checkpoint below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
