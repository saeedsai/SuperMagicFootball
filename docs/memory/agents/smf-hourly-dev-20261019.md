# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`  
**Updated:** 2026-10-26 01:03 CET

## Mission
Continue one tested bounded feature per hourly run on existing `dev` despite pending CI or deployment; no new branches, force pushes, security bypasses or premature promotion. Only `dev` and `main` permitted.

## Current checkpoint
- Before this increment `dev` and `main` both pointed to `493c50ed2a8d3d791f3eaeb31b5c404c7d7ac594`. Exact-head Modular QA #40244602437 and Full 4 Node + 4 Chromium #40244602372 passed; main Full #40244994365 and Pages #40244994402 passed. Those runs do not certify any newer commit or Render deployment.
- Current candidate `0.10.4.0`: LAN room occupancy advertisements and rejoinable seat state. Find Games disables full rooms, re-enables them when the guest leaves; server broadcasts availability on guest approval and departure. New focused Node regressions added; first Full Census preflight #40247745320 failed on stale safe-send alias assertion, repaired by test-only commit 5b299d12. Modular QA #40247829407 passed; Full Census #40247829435 pending at last observation. Physical two-phone acceptance pending.
- Preserve 223 teams/2676 players, six formations, four action buttons, ten Career/Cup slots, SD09, offline and saves. About-only version synchronized in package, release, README, SW cache and version policy. `main` must change only via green protected promotion.

## Next smallest action
1. Inspect new exact `dev` head and focused + full 4 Node/4 Chromium and Modular QA results; fix any failures on dev.
2. Verify hosted Render broker deployment matches latest server commit, not just service health.
3. Run two-client LAN discovery, consent, match input/snapshot and disconnect/rejoin Chromium acceptance.
4. Certify two real phones on the same Wi-Fi; test join after guest leaves, graphics and controls.
5. Promote only green exact dev head through protected pipeline; check main/Pages hosted byte smoke.

## Ownership and exclusions
Read AGENTS.md, VERSIONING_POLICY.md, shared memory and only this own checkpoint; never edit other agents' memory.

## Evidence
Prior-head green run IDs above; new-head checks not yet observed. Do not report hosted Render or physical device certification without evidence.

## Cleanup
Keep only dev/main, checkpoint below 4096 bytes, central dev log updated, no force pushes.
