# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.387 — MACE-SWEEP-MOMENTUM-READ-01.
- Mace Sweep's existing defensive read now accepts actual closing movement velocity when directional input is neutral, while retaining the existing facing and Defence-versus-Dribbling gates.
- CPU defenders that already qualify for that read no longer waste the .24-second telegraph by jumping; retreating, facing-away and low-Defence cases still use the existing JUMP response.
- Corrected three missing field-bounds arguments in the .386 grounded high-cross regression fixture; no .386 production code changed.

## Exact-head QA evidence
- Parent dev SHA: `44cf92b97a6bc3a589d3dbb79d773a1d408c1983`; main SHA: `ffc4ca5122abfd16849b69c705fa5f341cb52e7a`.
- .386 Modular QA #46082148024 failed one Node assertion because three grounded high-cross calls omitted the required bounds. Full Regression Census #46082148073 failed preflight for the same test failure; later shards did not run.
- .387 focused Node and actual-engine desktop/simulated-touch browser regressions added; exact-head Modular QA and Full Regression Census pending.

## Next smallest action
- Inspect .387 Modular QA and exact-head four-Node/four-Chromium Census. Repair confirmed failures without weakening assertions.
- Only a fully green exact dev head may pass the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.
- Continue through-ball interception, counterable Magic Tricks, goalkeeper reactions, existing-player animation/Studio QA, Player Studio usability and Career/Cup depth.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Main .382 Census #46074238725 and Pages deployment #46074231407 were successful; hosted smoke verified exact main HTML/JS/CSS bytes.
- Current main branch remains unprotected; repository rulesets were empty.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
