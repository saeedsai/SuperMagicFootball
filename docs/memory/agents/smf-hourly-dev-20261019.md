# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.263 — ART-JUMP-LANDING-BRACE-8VIEW-01:** normal and double-jump descent now adds a deterministic render-only landing brace near turf contact. Knees flex inward/down, arms lower/open for balance and the upper body compresses slightly around the waist. The pose is derived from current height and descending velocity, covers all eight existing headings, and does not write simulation state or change jump timing, collision or controls.
- **.262 fixture repair:** Full Regression Census #45383191826 failed only the browser net-threshold fixture, which expected a poke at range 88 despite a 65.4-unit predicted gap exceeding the strict 62-unit gate. Corrected the browser scenario to the 78-unit Node boundary in `8a47d159ec487fe7f2b091baa84b97a2b26d346e`; no gameplay threshold was weakened.
- Main remains .261 on SHA `5ab96a2ddf6eeb5763e7e1cc834aaedf995b3aed`; Pages #45379378786 and independent main Census #45379388061 passed.

## Next smallest action
Run Modular QA and exact-head Full Regression Census on .263. Fix confirmed source or fixture failures, then promote only a fully green exact dev SHA through the existing QA-gated pipeline; independently verify Pages deployment, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .262 Modular QA #45383191794 passed 2,851/2,851; Full Census #45383191826 failed one browser fixture only; correction committed as `8a47d159ec487fe7f2b091baa84b97a2b26d346e`.
- .261 dev Census #45377473225 passed all eight shards; .261 Pages #45379378786 succeeded; main Census #45379388061 passed hosted smoke and all eight shards.
- .263 includes the eight-heading landing-pose Node and Chromium regressions; exact-head gates pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
