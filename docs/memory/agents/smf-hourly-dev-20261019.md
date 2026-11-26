# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.315 — SCREAM-READY-DEFENDER-HANDOFF-01:** CPU Scream skips unavailable nearest opponents (down, invulnerable, shot-impact/shot-down/get-up/hurt recovery, invalid height or early JUMP below dodge height) and hands the warning to the next ready defender. The resolver uses the same target set, so the responder's existing JUMP/grounded SHOOT-slide is actually checked.
- .315 exact-head Modular QA and Full Regression Census must be inspected before any passing/certification claim.
- **0.12.81.314:** exact-head Census #45739022812 passed preflight, preview, all four Node and all four Chromium shards; QA-gated promotion succeeded. Pages #45740394957 deployed the same SHA.
- **0.12.81.314 main:** independent Census #45740402228 had preflight, preview, hosted smoke and Node shards 2/3 passed; remaining Node/Chromium shards were running at last observation.
- Dev/main last observed at SHA e1720386be42b69c068afa0c193148f21abaefe7. Branch protection #87 remains open (main.protected=false).

## Next smallest action
Complete exact-head .315 Modular QA and Full Regression Census (four Node/four Chromium shards). Fix confirmed failures; only a green exact head may proceed through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes, then continue a distinct backlog feature.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Studio art requires provenance and game-scale QA. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- .315: `src/modules/engine.js`; Node `magic_scream_ai_counter.test.cjs` and `magic_scream_jump_counter.test.cjs`; browser `magic_scream_ai_counter_browser_qa.py`.
- .314 dev Census #45739022812 passed all eight shards and promoted to main; Pages #45740394957 succeeded.
- .314 main Census #45740402228 was still running after preflight/preview/hosted smoke and Node 2/3 passed.

## Cleanup
Keep this checkpoint below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
