# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.386 — AI-KEEPER-HIGH-CROSS-TURN-AWARE-CONTEST-01.
- Grounded attackers contesting targeted high crosses are projected through their Agility-limited turn over the bounded 0.42-second landing read (110-unit cap). High-Agility runners turning away no longer falsely block a keeper claim; runners turning into the cross still contest.
- Shared helper: `keeperOutfielderTurnLead` in `src/modules/ai.js`, reused by parry-rebound and high-cross claim reads. Neutral/missing intent retains linear fallback.
- Focused Node: `tests/keeper_high_cross_claim.test.cjs`. Actual-engine desktop/simulated-touch QA: `tests/keeper_high_cross_claim_browser_qa.py`.

## Exact-head QA evidence
- Parent .385 final SHA: `9684599fe72ab1235806ca65e56a50c6d1670e6a`; main SHA: `ffc4ca5122abfd16849b69c705fa5f341cb52e7a`.
- .385 Modular QA #46081106746 passed 3,045/3,045 after correcting a team-1 test fixture that had been outside the synthetic field. No production code was changed by that repair.
- .385 Full Regression Census #46081106692 passed preflight and preview; Node shards 2 and 3 passed; Node shards 0 and 1 and all four Chromium shards were still running at the start of .386. Do not claim .385 certification or promotion without final eight-shard results.
- Earlier .384 Census #46077778146 failed browser shard 0 because a one-frame 16 ms sidestep assertion did not account for Agility-smoothed movement. .385 retains the run-lane heading and tests multi-frame actual movement.

## Next smallest action
- Verify .386 Modular QA and exact-head four-Node/four-Chromium Full Regression Census, especially both high-cross turn-direction cases in desktop and simulated-touch Chromium.
- Only a fully green exact dev head may pass the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.
- Continue through-ball interception, existing-player animation/Studio QA, goalkeeper reactions, Player Studio usability and Career/Cup depth. Do not repeat already-covered Breath or LAN work.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Main .382 Census #46074238725 passed all eight shards; Pages deployment #46074231407 succeeded; hosted smoke verified exact main HTML/JS/CSS bytes.
- .385 corrected Modular QA passed; its Full Regression Census was still running when .386 began.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
