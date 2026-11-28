# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.389 delivers a Hide Ball counter integration repair and an independent goalkeeper improvement.
- `GameEngine.tackle` uses dx/dy first, then normalized moveVX/moveVY when input is neutral, then facing for forward-arc selection. A targeted poke aims at its selected carrier; the no-target fallback stays legacy-compatible for extracted lead callers.
- `keeperParryReboundTarget` projects Agility-limited steering only with real movement (>=75 units/s) and meaningful dx/dy; high-Agility keepers can turn into a rebound from cross-track momentum. Neutral/invalid input retains the old estimate.
- Release surfaces and .389 cache identity are updated. No save/schema, roster, formation or action changes.

## Next smallest action
- Inspect the final .389 Modular QA and exact-head Full Regression Census; especially Hide Ball actual-engine poke/resolver and keeper turn-intent desktop/simulated-touch scenarios.
- Repair confirmed failures without weakening assertions. Only a green exact dev head may enter the existing QA-gated main pipeline.
- Continue intelligent passing/tackling and trick counterplay, then goalkeeper, existing-player eight-view animation/Studio QA, Player Studio usability and Career/Cup depth.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Candidate .389 parent: `fa09037880285a480f33ea787a83a6d02878b272`.
- First .389 source commit: `b0f953879cd168c410ced2c61a44aa1e09bdf4ce`.
- Metadata head before this corrective commit: `0b2f75cec1b6befdee440cbd69d2218a27c9321c`.
- Main: `ffc4ca5122abfd16849b69c705fa5f341cb52e7a`.
- Main remains unprotected; repository rulesets were empty.

## Evidence
- .388 Modular QA #46084117071 passed 3,051/3,051.
- .388 Full Regression Census #46084117033: preflight, preview, all four Node shards and browser shards 0, 1, 3 passed; browser shard 2 failed the actual-engine Hide Ball neutral-input PASS-poke scenario.
- .389 source QA #46086701089: 3,051/3,053 passed. Two diagnosed failures are the stale source assertion and extracted no-target fallback described in the master backlog. Corrected without relaxing gameplay checks.
- Exact final .389 Modular QA and four-Node/four-Chromium Census are required; promotion/deployment remain blocked until green.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
