# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-10-27

## Mission
Continue bounded tested dev increments; promote only exact-green dev through protected PR. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, saves and offline.

## Current checkpoint
- Base dev 9035a4b77272695b82e5270887b656209146c2e2; main b3c8100a88e924dd4209396898116877602d284d; PR #56 open. Candidate 0.11.4.9 validates exact session/build/opposite role before storing one early P2P relay hello. P2P-RELAY-06 rejects invalid predecessors even if later guest echo is lost.
- Source-extracted RelayChannel isolated Node harness: 3/3 pass. Full repo focused suite, exact-head 4 Node + 4 Chromium and Modular QA require GitHub Actions jobs; Full #40549189858 and Modular #40549189946 were queued at inspection. Preceding commit 9035a4b7 removed workflow-level Full concurrency; runner scheduling recovery unverified.
- Main/Pages/Render and physical two-client LAN/P2P acceptance are not certified for this candidate. Prior green runs do not certify the current head.

## Next five actions
1. Inspect exact-head Full 4+4 and Modular QA, diagnose scheduling and fix real failures.
2. After all required exact-head checks pass, promote through protected PR #56 and confirm main SHA.
3. Verify Pages hosted byte hashes and Render broker health/relay support.
4. Validate physical two-device LAN and cross-network P2P Host/Approve/Play/fallback.
5. Continue Player Studio, counterable four-button Tricks and Crown Royals directional art.

## Ownership and exclusions
Never create other branches, force push, bypass CI/security, touch other agents' memory or claim unobserved tests. Keep checkpoint under 4 KiB.
