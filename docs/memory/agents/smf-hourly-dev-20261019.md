# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-10-27

## Mission
Keep developing one tested bounded dev increment hourly even when release is pending; only promote exact-green head via protected PR. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, saves and offline.

## Current checkpoint
- Baseline dev a470bf4b49b5fb27e4eec7410604a208cab4627d; main b3c8100a88e924dd4209396898116877602d284d; PR #56 open. Candidate 0.11.4.10 fixes approved relay pre-open hello buffering: use real LAN parser (4 KiB maximum) so an oversized matching hello cannot starve a valid guest. P2P-RELAY-07 adds two-peer handshake, lost echo and first input coverage.
- Source-extracted before/after check reproduced oversized hello starving valid one on old source, then accepted valid one on patched source. Full repository tests, exact-head 4 Node + 4 Chromium and Modular QA require GitHub Actions; do not claim unobserved green results.
- Full #40557088884 preflight entered in_progress (Node contracts executing) on prior candidate; #40557097481 and Modular #40557097619 queued at last inspection. Prior workflow-level concurrency removal appears to have allowed a preflight to start; not yet proof of complete recovery.
- Main/Pages/Render and physical two-client LAN/P2P acceptance remain unverified for this candidate.

## Next five actions
1. Inspect exact-head Full 4+4 and Modular QA; repair actual failures and runner scheduling.
2. Promote only the exact fully green dev head through protected PR #56; confirm main SHA.
3. Verify Pages hosted SHA-256 bytes and Render signaling/relay health.
4. Validate real two-device LAN and cross-network P2P Host/Approve/Play/fallback.
5. Continue Player Studio, counterable four-button Tricks and Crown Royals directional art.

## Exclusions
Never create other branches, force-push, bypass CI/security or touch other agents' memory. No deployment claims without evidence.
