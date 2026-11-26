# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.317 — FIREBALL-READY-TARGET-RESOLVER-PARITY-02:** .316 Census #45747415272 exposed the production mismatch: CPU handed the wind-up to a ready teammate, but tryMagicTrick still selected the nearer invulnerable opponent. .317 applies the same ready-target filter to Fireball/Freeze/Bat as to Scream.
- First .317 exact-head QA: Modular #45753448482 and Census #45753448500 failed Node preflight on four legacy contracts. Three fixtures expected invalid-height (NaN z) opponents to be hit; the new filter correctly excludes them. The named-trick source contract still expected the old screamTargets identifier. Tests are corrected to use valid grounded/early-jump targets and assert invalid-height no-target behavior; the source contract now checks readyCounterTargets.
- .316 Modular QA #45747415256 passed; .316 Census #45747415272 failed only the actual-engine Fireball handoff browser test (71 passed, 1 failed).
- .314 exact dev Census #45739022812 and Modular QA #45739022679 passed; Pages #45740394957 deployed main SHA e1720386be42b69c068afa0c193148f21abaefe7; independent main Census #45740402228 succeeded on attempt 2.
- Base before .317: dev d2df56c7e9f49c2e296e97a05a628feebd3b3e0e; main e1720386be42b69c068afa0c193148f21abaefe7.

## Next smallest action
Commit the focused .317 regression-contract repairs, inspect exact-head Modular QA and Full Regression Census, then continue an independent player-facing gameplay increment on dev. Only green exact-head CI may promote through the existing QA-gated main pipeline.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- .317 runtime fix: src/modules/engine.js; focused Node and actual-engine browser handoff regressions.
- .317 first QA failure: #45753448482 and #45753448500; logs show invalid-height fixture expectations and one stale source-contract identifier.
- .316 confirmed runtime failure: #45747415272, magic_fireball_ai_counter_browser_qa.py; nearest invulnerable target absorbed the resolver selection.
- .314: dev Census/QA passed, Pages deployment succeeded, main Census succeeded on attempt 2.

## Cleanup
Keep this checkpoint below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
