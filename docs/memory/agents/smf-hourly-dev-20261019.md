# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.264 — AI-FIRST-TOUCH-SLIDE-PRIORITY-01:** a valid pressured first-touch slide read by the primary CPU defender now takes priority over the general relative-closing PASS poke. This prevents the cheaper poke from consuming the frame before the existing probabilistic slide counterplay. Existing range, speed, direction, pressure, exposed-ball, probability and physical-contact gates remain authoritative. The .263 eight-view normal/double-jump landing brace is retained.
- **.263 exact-head diagnosis:** Modular QA #45393274699 passed 2,851/2,851; Census #45393274541 passed preflight, preview and all four Node shards but failed the first-touch slide browser case and the 64px reduced-flash repeat tolerance (observed maximum five pixels against four). .264 fixes both; exact-head gates pending.
- Main remains .261 on SHA `5ab96a2ddf6eeb5763e7e1cc834aaedf995b3aed`; Pages #45379378786 and independent main Census #45379388061 passed.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .264. Fix any confirmed failures, then promote only a fully green exact dev SHA through the existing QA-gated pipeline; independently verify Pages deployment, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .263 Modular QA #45393274699 passed 2,851/2,851; Census #45393274541 failed two browser scripts after preflight, preview and all four Node shards passed.
- .261 dev Census #45377473225 passed all eight shards; .261 Pages #45379378786 succeeded; main Census #45379388061 passed hosted smoke and all eight shards.
- .264 adds an actual-engine first-touch slide-priority Node regression and retains desktop/simulated-touch browser acceptance.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
