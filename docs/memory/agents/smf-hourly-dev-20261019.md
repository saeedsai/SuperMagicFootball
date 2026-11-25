# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.279 — AI-KEEPER-HIGH-CROSS-RECOVERY-EXCLUSION-01:** grounded outfielders with active shot-impact knockdown pending, knockdown or get-up recovery no longer block a targeted high-cross keeper claim by appearing to win the landing race. The intended receiver must still be active.
- Production change: `src/modules/ai.js`. Mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover both goals, opponent/teammate recovery and all three recovery phases.
- Prior .278 is certified and promoted: dev Census #45508184667 and Modular QA #45508184835 passed; main Census #45511050749 and Pages deployment #45511038995 passed at SHA `77e92e2dd7fb4d0c3ab021aeda01ac30c8c9318b`. Main hosted-pages smoke passed; no separate byte-comparison workflow was found in the current Actions page.
- New .279 exact-head tests and release gates are pending.

## Next smallest action
Run exact-head Modular QA and the full four-Node/four-Chromium Census. Fix any confirmed source or fixture failures, then allow only a green exact dev head through the existing QA-gated promotion. Verify main Census, Pages deployment and hosted smoke independently.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical two-phone acceptance and #86 Render drift open; authenticated online hosting is not live without owner resources.

## Evidence
- .278 exact dev Census: #45508184667, all four Node and all four Chromium shards passed.
- .278 Modular QA: #45508184835 passed.
- .278 main Census: #45511050749 passed preflight, preview, hosted-pages smoke and all eight shards.
- .278 Pages deployment: #45511038995 passed.
- #87 remains a real security issue; branch metadata reports `protected=false` for both main and dev, and repository rulesets are empty.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
