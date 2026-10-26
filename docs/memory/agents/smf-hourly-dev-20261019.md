# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`  
**Updated:** 2026-10-26 02:02 CET

## Mission
Keep shipping one bounded tested feature per hour directly on existing dev, regardless of release blockers. Only dev/main; no force pushes or security bypasses.

## Current checkpoint
- Pre-increment dev/main both `00693635aed3acdf884a438b2e532e4e8320dca5`. Modular QA #40247926756, dev Full 4+4 #40247926757, main Full #40248408054, Pages #40248408311 all successful on that exact SHA.
- New dev candidate `0.10.5.0`: Find Games polls the room directory every 10s to recover missed advertisements, suppresses polling while join is pending/approved and cancels polling on reset/dispose. Focused Node test covers offline, reconnect, join, rejection and stop. New-head CI/promotion/hosted checks pending at commit creation.
- Preserve 223 teams/2676 players, six formations, four gameplay buttons, ten Career/Cup slots, SD09, offline and saves. Candidate and certified production are separate.

## Next smallest action
1. Inspect exact dev CI 4 Node+4 Chromium and Modular QA; repair any red tests without pausing feature work.
2. Diagnose Render broker auto-deploy lag and verify hosted server commit.
3. Verify two-client LAN discovery, consent, kickoff, inputs, snapshots and rejoin.
4. Validate real-phone same-network controls and graphics when physical devices available.
5. Promote only exact green dev head via protected pipeline; confirm main/Pages bytes and hosted smoke.

## Ownership and exclusions
Read AGENTS.md, VERSIONING_POLICY.md, shared memory and only this own checkpoint. Never edit other agents' memory.

## Evidence
Previous head CI and Pages URLs recorded in central log; new feature unverified until new-head checks complete. Render and physical phone certification not claimed.

## Cleanup
Keep only dev/main, checkpoint <4 KiB and no force pushes.
