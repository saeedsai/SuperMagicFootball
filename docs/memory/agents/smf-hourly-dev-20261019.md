# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26 03:00 CET

## Mission
Ship one bounded tested increment each hour on existing dev. Only dev/main; never bypass security, green CI or branch protection.

## Current checkpoint
- Pre-increment dev/main `f628c4da491afa4922ec943e08c075f29c6961d3` (0.10.5.0). Dev Modular #40252414893 and Full 4+4 #40252414869, main Full #40253122511 and Pages #40253122594 passed.
- New 0.10.6.0 candidate: server responds to Find Games refresh with an authoritative LAN-scoped room snapshot; guest removes stale rooms, rejects malformed snapshots, and preserves in-progress join requests. Node helper and UI flow regressions included. New-head CI/promotion/hosted verification pending.
- Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves. Candidate is not a certified production release.

## Next smallest action
1. Inspect new-head Modular and Full 4 Node+4 Chromium CI; fix any failures.
2. Diagnose Render auto-deploy not triggering after first commit; deployed broker still c871ee69 at inspection.
3. Verify hosted broker exact commit and two-browser room refresh, approval, kickoff and rejoin.
4. Complete real-phone same-LAN graphics, inputs, sync and reconnect QA.
5. Promote exact green dev head through protected workflow and verify Pages hosted bytes.

## Ownership and exclusions
Only this own checkpoint is writable; do not read or edit other agents' memory. No new branches, force pushes or protection bypass.

## Evidence
Render service srv-dbf8m6gm7kps7385tjo0 autoDeploy=yes branch=dev; list_deploys showed only c871ee69. New-head tests are not certified until CI runs.

## Cleanup
Keep this checkpoint under 4 KiB; only dev/main.
