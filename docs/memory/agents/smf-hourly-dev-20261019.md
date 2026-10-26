# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26 05:07 CET

## Mission
One bounded tested feature per hour directly on dev. Only dev/main, no forced pushes or bypass.

## Current checkpoint
- Previous dev/main `3e13616fb8fbf536f6d4c6d5adf5cdad13f60e50` green: dev Modular #40262382280, Full 4+4 #40262382251, main Full #40262713234, Pages #40262715556.
- New 0.10.6.2 candidate: pending LAN guest approval times out at 25s, cancels stale join, resumes directory refresh and permits retry; late approval ignored. Focused regression added; exact-head CI pending.
- Render srv-dbf8m6gm7kps7385tjo0: autoDeploy=yes dev, only c871ee69 deployed; physical two-phone QA unverified.
- Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves.

## Next smallest action
1. Check exact-head Modular and 4 Node + 4 Chromium Full; repair failures.
2. Diagnose Render GitHub auto-deploy trigger failure safely.
3. Verify real two-client host/guest, kickoff, controls, reconnect and graphics.
4. Implement next Player Studio/counterable Trick feature directly on dev.
5. Promote only exact green head via protected CI, verify main and Pages bytes.

## Ownership and exclusions
Only this developer checkpoint writable; no other agent memory, no extra branches or force push.

## Evidence
Previous exact-head CI and Pages green. Render deployment/events show initial c871ee69 only, 2026-10-25 23:05Z. New test awaiting CI.

## Cleanup
Keep under 4 KiB and report uncertified hosted/device LAN truthfully.
