# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.306 — AI-FIRST-TOUCH-AGILITY-READ-01:** CPU first-touch SHOOT-slide counter-press timing now uses defender Agility for its relative-closing threshold. Average 50 preserves 85 units; elite 100 reads at 70; low 1 needs 99.7, bounded 70–100. Existing run-up, alignment, first-touch pressure, exposed-ball, probabilistic chance and physical slide gates remain.
- Focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both attack directions, rating boundaries, missing/invalid fallback and four actions.
- The .305 third-man arrival browser fixture now reconstructs that scenario in a fresh match, with explicit carrier ownership, to isolate actual-engine dispatch from earlier AI drives.

## Branches and release
- Parent dev head: `72028e160ac69cbb4317346d681ac9479f3a1a8e` (.305).
- Main head: `4de12cdfd3af3eb8d70aa184157bcb63e9ab515b` (.304).
- .304 Pages deployment #45681044512 and independent main Census #45681056688 passed; hosted smoke verified.
- .305 Modular QA #45682699629 passed 2,913/2,913; Full Regression Census #45682699674 had one third-man arrival browser failure; failed-job-only retry is running.
- .306 is a new dev candidate; exact-head QA/Census pending.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Next smallest action
Run Modular QA and Full Regression Census on exact .306 HEAD. Fix confirmed failures without weakening gameplay. Only a green exact head may advance through the existing QA-gated pipeline; independently verify main Census, Pages and hosted bytes.

## Evidence
- .305 Modular QA #45682699629 passed 2,913/2,913.
- .305 Full Regression Census #45682699674: preflight, preview and all Node shards passed; one third-man runner browser failure is under failed-job-only retry.
- .304 Pages and independent main Census passed.
- .306 focused Node/browser regressions are included; results pending.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
