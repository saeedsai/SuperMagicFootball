# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.288 — AI-MAGIC-READ-LIVE-INPUT-COUNTERPRESS-01:** after a successful visible second-defender Magic Trick read, CPU counterpress positioning now follows the carrier's current 2D directional input before residual movement momentum. A diagonal cut redirects the screen into the new forward lane; neutral input falls back to movement momentum, and backward input cancels the forward screen. The .42-second read window, primary presser, no-auto-tackle behavior and skill contest remain unchanged.
- Production change: `src/modules/ai.js`. Existing Magic Trick secondary-screen Node and actual-engine desktop/simulated-touch Chromium suites now cover both teams, diagonal post-read input, neutral fallback and backward rejection.
- **0.12.81.287 promoted and deployed:** exact-head Modular QA #45562433034 and dev Full Regression Census #45562433019 passed on SHA `76426e1492c75b8280151e986cdfa20a2a50efe7`. Main Census #45563580753 and Pages deployment #45563570683 also succeeded on that exact SHA; dev and main are equal.
- .287's initial 11 Node failures were one `targetDx/targetDy` declaration error; the follow-up source fix passed exact-head gates and was promoted normally.

## Next smallest action
Run exact .288 Modular QA and four-Node/four-Chromium Full Regression Census. Fix only confirmed failures; then verify QA-gated promotion, Pages deployment, independent main Census and hosted-byte smoke. Continue with the next bounded gameplay or existing-player Studio item.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. Authenticated online hosting is not live without owner resources.

## Evidence
- .288 parent/dev/main before commit: `76426e1492c75b8280151e986cdfa20a2a50efe7`.
- .287 dev Modular QA/Census passed; QA-gated promotion, main Census and Pages deployment passed on the same SHA.
- GitHub REST reports `dev.protected=false`, `main.protected=false`; repository rulesets are empty and #87 remains open. #48 remains open; no physical two-phone certification is claimed.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
