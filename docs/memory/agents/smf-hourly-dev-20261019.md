# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.388 — TRICK-HIDE-BALL-LIVE-MOMENTUM-READ-01.
- Hide Ball CPU target/backup selection and the live resolver now use dx/dy, then actual moveVX/moveVY, then legacy facing. Closing momentum can execute the existing timed PASS poke despite stale facing; retreating momentum cannot falsely counter.
- Selected-human authority, CPU backup, reaction delay, 70-unit cone, hold window, costs/cooldown and four actions remain unchanged.
- .387 Mace Sweep momentum-read feature remains in production; both VM resolver fixtures inject the shared helper correctly.

## Exact-head QA evidence
- .387 Modular QA #46083614246 passed 3,048/3,048 Node tests on `67b1dc20b3e99c61afcf88cd7ef73260ef4cd60d`.
- .387 Full Regression Census #46083614292 preflight and preview passed; Node shards 2 and 3 passed; Node shards 0/1 and Chromium shards 0–3 were still running when dev advanced.
- Initial .388 Modular QA #46083931055 ran 3,051 tests: 3,049 passed, two failed. The Hide Ball resolver mismatch was fixed in `ea467aa7496ba6bc27e4c3f136a21ba8ac372fc0`; the other failure was this missing Evidence heading.
- Initial .388 Full Regression Census #46083931007 stopped at preflight. Final .388 Modular QA and four-Node/four-Chromium Census pending.

## Next smallest action
- Inspect final .388 Modular QA and exact-head Census, especially live Hide Ball PASS-poke resolution on both teams in desktop and simulated-touch Chromium. Repair confirmed failures without weakening assertions.
- Only a fully green exact dev head may pass the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.
- Continue through-ball interception, further counterable tricks, goalkeeper reactions, existing-player animation/Studio QA, Player Studio usability and Career/Cup depth.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads at .388 start
- Parent dev: `ea467aa7496ba6bc27e4c3f136a21ba8ac372fc0`.
- Main: `ffc4ca5122abfd16849b69c705fa5f341cb52e7a`.
- Main remains unprotected; repository rulesets were empty.

## Evidence
- The .387 main predecessor .382 had successful main Census #46074238725 and Pages deployment #46074231407; hosted smoke verified exact main HTML/JS/CSS bytes.
- The .387 modular gate passed 3,048/3,048; .387 full Census was still running when the new .388 feature was introduced.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
