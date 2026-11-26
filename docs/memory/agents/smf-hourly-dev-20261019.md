# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.317 — FIREBALL-READY-TARGET-RESOLVER-PARITY-02:** .316 Census #45747415272 exposed the production mismatch: CPU handed the wind-up to a ready teammate, but tryMagicTrick still selected the nearer invulnerable opponent. .317 applies the same ready-target filter to Fireball/Freeze/Bat as to Scream.
- First .317 exact-head QA #45753448482/Census #45753448500 failed four legacy contracts: three Magic Trick fixtures expected invalid-height (NaN z) opponents to be hit, and one source contract expected screamTargets. Those were corrected in commit 1701c1b70c73271d0840b1fb5a89b2e9668d05bf.
- Second .317 QA #45753781235/Census #45753781305 then exposed one remaining Bat fixture expecting a NaN-height target to be hit. It is now corrected to assert no target/no hit while preserving grounded, low-jump and out-of-range cases.
- .316 Modular QA #45747415256 passed; .316 Census #45747415272 failed the actual-engine Fireball handoff browser test (71 passed, 1 failed).
- .314 exact dev Census #45739022812 and Modular QA #45739022679 passed; Pages #45740394957 deployed main SHA e1720386be42b69c068afa0c193148f21abaefe7; independent main Census #45740402228 succeeded on attempt 2.

## Next smallest action
Commit the final .317 regression-contract correction, inspect exact-head Modular QA and Full Regression Census, then continue an independent gameplay increment on dev. Only green exact-head CI may promote through the existing QA-gated main pipeline.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- .317 runtime fix: src/modules/engine.js; focused Node and actual-engine browser handoff regressions.
- .317 first/second QA failures: #45753448482, #45753448500, #45753781235 and #45753781305; remaining failure was a legacy Bat NaN-height expectation.
- .316 confirmed runtime failure: #45747415272, magic_fireball_ai_counter_browser_qa.py; nearest invulnerable target absorbed the resolver selection.
- .314: dev Census/QA passed, Pages deployment succeeded, main Census succeeded on attempt 2.

## Cleanup
Keep this checkpoint below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
