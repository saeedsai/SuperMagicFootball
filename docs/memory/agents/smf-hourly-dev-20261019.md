# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.265 — KEEPER-CUTBACK-RUNNER-ARRIVAL-READ-01:** CPU goalkeeper cutback shading selects an active central runner by bounded 120 ms projected x/y arrival (18 units per axis), not current feet alone. A currently central runner moving out cannot outrank a slightly farther teammate moving into the cutback pocket. Existing eligibility, behind-carrier/depth windows, forward movement guard, GK Skill weighting and 58-unit cap remain.
- Gameplay commit: 8652b575e3e44b065e669492c36d356001c90f0f. Release metadata commit: f88c1b4eb65bb19561693d475968f8f6aceb42be. Exact-head .265 QA/Census pending.
- .264 Modular QA #45402146228 passed. Full Census #45402146316 failed only player_jump_air_pose_browser_qa.py on both attempts; .265 adds document.fonts.ready before the unchanged six-pixel repeated-raster assertion.
- Main remains .261 on SHA 5ab96a2ddf6eeb5763e7e1cc834aaedf995b3aed; Pages #45379378786 and independent main Census #45379388061 passed.

## Next smallest action
Run exact-head Modular QA and four-Node/four-Chromium Census for .265. Fix any confirmed failures, then promote only a fully green exact dev SHA through the existing QA-gated pipeline; independently verify Pages deployment, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .264 Modular QA #45402146228 passed; Full Regression Census #45402146316 failed one browser script on both attempts; .265 waits for browser fonts before unchanged raster assertions.
- .265 adds mirrored actual-engine Node and desktop/simulated-touch Chromium cutback-arrival acceptance.
- .261 dev Census #45377473225 passed all eight shards; .261 Pages #45379378786 succeeded; main Census #45379388061 passed hosted smoke and all eight shards.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
