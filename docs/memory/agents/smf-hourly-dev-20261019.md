# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Continue one bounded tested increment per hourly run directly on dev, even if release is queued. Never create branches beyond dev/main, bypass protections, force-push or stop for pending releases. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- Baseline dev `9e07d47baffe64123afe0f14800b86b3712696ee`; main `b3c8100a88e924dd4209396898116877602d284d`. PR #56 open, mergeable_state unstable; exact-head Full #40574997917 and Modular #40574998177 queued, not green.
- Candidate 0.11.4.12 P2P-RELAY-09: guest retains only exact-session/build, opposite-role host hello before its relay channel exists. Replays after listeners open; rejects malformed, stale and >4 KiB frames; clears on close/failure.
- Checkpoint repaired to include all six required sections from `tests/project_memory_contract.test.cjs`. README/About/package/SW/cache/policy aligned.

## Next smallest action
1. Inspect new exact-head Full 4 Node + 4 Chromium and Modular QA; fix concrete failures.
2. Promote only completely green unchanged dev via protected PR #56; confirm main SHA.
3. Verify Pages deployment/hosted SHA-256 byte smoke and Render broker health.
4. Validate two physical phones for LAN and cross-network P2P discovery, consent, fallback, gameplay and graphics.
5. Continue Player Studio, counterable four-button Tricks and Crown Royals directional art.

## Ownership and exclusions
Sole developer `smf-hourly-dev-20261019`. No other agent memory edits; no new branches, no security bypass or physical QA claims.

## Evidence
Isolated source-equivalent Node smoke for pre-channel validation and lifecycle: 2/2 pass. Permanent real-module P2P-RELAY-09 regression prepared for CI but not executed locally against full repo. Full CI queued on previous head; new-head CI and main/Pages not verified.

## Cleanup
No stale branch deletion or release promotion attempted while exact-head checks remain queued. Continue coding independently on dev.
