# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.318 — AI-HUMAN-MARKER-BACKUP-COUNTER-01:** during Fireball/Freeze/Bat wind-ups, the selected human marker keeps control while the nearest ready CPU teammate backs them up if the human has not already started an effective JUMP/slide. The resolver recognizes any ready defender's existing counter inside the same radius, even when the human remains the nearest hit target.
- .318 adds mirrored Node tests and actual-engine desktop/simulated-touch browser acceptance for both teams, all three tricks, idle-human backup and no duplicate when the human already counters.
- .318 first QA #45754673064/#45754673060 exposed four stale source-contract assertions; corrected in b5e6fd3b242c9952622448c22e41e4a836b24452 and 5c8191b5016fa3c54bdb2da3c3251fa4ec7f716f.
- .317 Modular QA #45754005674 passed. Full Regression Census #45754005684 passed all Node shards and preview, browser shard 2 passed, but browser shards 0 and 1 failed three legacy invalid-height Fireball/Bat/Freeze expectations; browser shard 3 was still running. The production filter correctly excludes NaN-height targets; three actual-engine browser fixtures now assert no target/no stun for invalid height. .317 was superseded before promotion.
- .316 Modular QA #45747415256 passed; .316 Census #45747415272 exposed the resolver mismatch fixed in .317.
- .314 exact dev Census #45739022812 and Modular QA #45739022679 passed; Pages #45740394957 deployed main SHA e1720386be42b69c068afa0c193148f21abaefe7; independent main Census #45740402228 succeeded on attempt 2.
- Base before current .318 test correction: dev 5c8191b5016fa3c54bdb2da3c3251fa4ec7f716f; main e1720386be42b69c068afa0c193148f21abaefe7.

## Next smallest action
Inspect exact-head .318 Modular QA and four-Node/four-Chromium Full Regression Census after the focused invalid-height browser expectations are aligned. Fix any confirmed runtime/browser failure; only a green exact head may promote through the existing QA-gated main pipeline.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- .318 gameplay: src/modules/engine.js; Node AI responder tests; actual-engine desktop/simulated-touch Fireball/Freeze/Bat browser test; shared counterRivals source contracts.
- .318 first QA failure: #45754673064/#45754673060, stale source contracts; corrected in follow-up commits.
- .317: Modular QA #45754005674 passed; Census #45754005684 all Node shards passed, browser shards 0/1 failed invalid-height fixture expectations, shard 2 passed, shard 3 still running at last check.
- .316 failure: #45747415272; resolver target mismatch confirmed in browser shard 2.
- .314: dev Census/QA passed, Pages deployment succeeded, main Census #45740402228 succeeded on attempt 2.

## Cleanup
Keep this checkpoint below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
