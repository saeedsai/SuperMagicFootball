# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.389 combines a confirmed .388 Hide Ball PASS-poke integration repair with an independent goalkeeper improvement.
- `GameEngine.tackle` now uses dx/dy, then normalized moveVX/moveVY, then legacy facing to select the forward arc and fallback punch direction. This aligns the actual poke with the movement-aware Hide Ball reaction and resolver.
- `keeperParryReboundTarget` now projects Agility-limited steering only when real movement (>=75 units/s) and meaningful dx/dy are present; high-Agility keepers can turn into a rebound from cross-track momentum. Neutral/invalid input retains the exact old estimate.
- Release surfaces and .389 cache identity updated; no save/schema, roster, formation or action changes.

## Next smallest action
- Inspect .389 Modular QA and exact-head Full Regression Census; especially Hide Ball actual-engine poke/resolver on both teams and keeper turn-intent desktop/simulated-touch scenarios.
- Repair confirmed failures without weakening assertions. Only a green exact dev head may enter the existing QA-gated main pipeline.
- Continue intelligent passing/tackling and trick counterplay, then keeper behavior, existing-player eight-view animation/Studio QA, Player Studio usability and Career/Cup depth.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads at .389 start
- Parent dev: `fa09037880285a480f33ea787a83a6d02878b272`.
- Main: `ffc4ca5122abfd16849b69c705fa5f341cb52e7a`.
- Main and dev were both unprotected; repository rulesets were empty.

## Evidence
- .388 Modular QA #46084117071 passed 3,051/3,051 Node tests on the parent dev head.
- .388 Full Regression Census #46084117033: preflight, preview, all four Node shards and browser shards 0, 1 and 3 passed; browser shard 2 failed the actual-engine Hide Ball neutral-input PASS-poke scenario. Job log confirmed 73 browser tests passed and one failed; this exposed the tackle-heading integration bug repaired in .389.
- Main .382 Census #46074238725 and Pages deployment #46074231407 were previously successful with hosted-byte smoke.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
