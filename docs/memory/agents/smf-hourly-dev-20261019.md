# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.388 — TRICK-HIDE-BALL-LIVE-MOMENTUM-READ-01.
- Hide Ball CPU target/backup selection now checks live moveVX/moveVY when dx/dy are neutral before falling back to facing. Closing movement can use the existing timed PASS poke despite stale facing; retreating movement cannot falsely counter. Zero-motion facing fallback remains.
- .387 Mace Sweep momentum-read feature remains in production; its two existing VM resolver fixtures now inject the shared helper correctly.
- .386 keeper regression's three missing bounds arguments were corrected.

## Exact-head QA evidence
- .387 feature commit: `7961f71b75bee13e637ee402dd33d9d5a610de45`; harness corrections: `9438f6da30a3bceb3ff6b58a515e33575dc8be6a` and `67b1dc20b3e99c61afcf88cd7ef73260ef4cd60d`.
- .387 Modular QA #46083614246 passed 3,048/3,048 Node tests on `67b1dc20b3e99c61afcf88cd7ef73260ef4cd60d`.
- .387 Full Regression Census #46083614292 preflight and preview passed; Node shards 2 and 3 passed; Node shards 0/1 and Chromium shards 0–3 were still running when dev advanced.
- .388 focused Node and actual-GameEngine desktop/simulated-touch browser regressions added; exact-head Modular QA and Census pending.

## Next smallest action
- Inspect .388 Modular QA and exact-head four-Node/four-Chromium Census. Repair confirmed failures without weakening assertions.
- Only a fully green exact dev head may pass the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.
- Continue through-ball interception, further counterable tricks, goalkeeper reactions, existing-player animation/Studio QA, Player Studio usability and Career/Cup depth.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads at .388 start
- Parent dev: `67b1dc20b3e99c61afcf88cd7ef73260ef4cd60d`.
- Main: `ffc4ca5122abfd16849b69c705fa5f341cb52e7a`.
- Main remains unprotected; repository rulesets were empty.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
