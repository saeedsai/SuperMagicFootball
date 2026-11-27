# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.387 — MACE-SWEEP-MOMENTUM-READ-01.
- Grounded defenders use actual closing movement velocity when directional input is neutral, while preserving the existing facing and Defence-versus-Dribbling gates. CPU defenders already meeting the read no longer waste the .24-second telegraph by jumping.
- Corrected the .386 grounded high-cross test's three missing bounds arguments.
- Corrected two existing Mace Sweep Node harnesses to inject the new shared read helper; production gameplay is unchanged by this follow-up.

## Exact-head QA evidence
- Feature commit: `7961f71b75bee13e637ee402dd33d9d5a610de45`; parent dev SHA: `44cf92b97a6bc3a589d3dbb79d773a1d408c1983`; main SHA: `ffc4ca5122abfd16849b69c705fa5f341cb52e7a`.
- .386 Modular QA #46082148024 failed one keeper test because three calls omitted bounds; fixed in .387.
- First .387 Modular QA #46083298080 ran 3,048 tests: 3,044 passed, four failed because two existing Mace Sweep test harnesses omitted the new shared helper when extracting the resolver. The new focused .387 tests and .386 keeper test passed. Census #46083298087 failed preflight for the same harness dependency.
- Follow-up injects the actual helper into both harnesses; exact-head Modular QA and Census pending.

## Next smallest action
- Inspect the .387 corrective-head Modular QA and exact-head four-Node/four-Chromium Census. Repair confirmed failures without weakening assertions.
- Only a fully green exact dev head may pass the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.
- Continue through-ball interception, counterable Magic Tricks, goalkeeper reactions, existing-player animation/Studio QA, Player Studio usability and Career/Cup depth.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Main .382 Census #46074238725 and Pages deployment #46074231407 were successful; hosted smoke verified exact main HTML/JS/CSS bytes.
- Current main branch remains unprotected; repository rulesets were empty.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
