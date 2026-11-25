# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.310 — AI-CARRIER-INPUT-TURN-PRESS-READ-01:** CPU primary/support press scoring and the primary interception lead now project a moving opponent through its current 2D input, with turn angle limited by existing Agility. High-Agility carriers can reach a cut lane sooner; low-Agility carriers retain more momentum. Actual player movement is unchanged.
- .309 exact-head Census #45711536186 passed preflight, preview and all Node shards plus browser shards 1–3; browser shard 0 failed only the Online Account UI delayed-switch loading assertion. Failed-job-only rerun job 139547501910 started. No .309 promotion/deployment is claimed.

## Next smallest action
Complete exact-head Modular QA and four-Node/four-Chromium Full Regression Census for .310; fix confirmed failures, then allow only a green exact head through the existing QA-gated main pipeline. Check the .309 failed-job rerun for transient versus reproducible account-switch timeout.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance and game-scale QA. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- Starting dev HEAD: `165b63464f03f6f85c392134046af288706946f4`; starting main HEAD: `74cad1b16a1fc408bb89a46a84e57e1e309f8993`.
- .309 Modular QA #45711535971: 2,918/2,918 passed.
- .309 Census #45711536186: all Node shards and browser shards 1–3 passed; browser shard 0 had one Online Account UI timeout assertion and was queued for failed-job rerun.
- .309 was not promoted. Main remains .308; its prior Pages and independent main Census evidence is recorded in the master backlog.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
