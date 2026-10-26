# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26 06 CET

## Mission
One bounded tested increment hourly on dev; only dev/main, no force or bypass.

## Current checkpoint
- Previous dev/main `01dfa202e8ad76791717a1cb7935d1284bbc6a07` green: dev Modular #40267581032, Full 4+4 #40267580859; main Full #40267885832, Pages #40267885527.
- New 0.10.6.3 candidate validates incremental LAN room announcements, bounds guest directory at 128 while allowing updates and legacy missing-full room cards. Focused Node regression added; new-head CI pending.
- Render srv-dbf8m6gm7kps7385tjo0 autoDeploy=yes on dev, but only initial manual deploy c871ee69 live; real two-phone LAN unverified.
- Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves.

## Next smallest action
1. Verify exact-head Modular and full four Node/four Chromium; fix failures.
2. Investigate Render GitHub auto-deploy integration; do not manually trigger when autoDeploy enabled.
3. Validate two actual LAN clients host/guest, kickoff, input, reconnect and graphics.
4. Implement next Player Studio or counterable Trick increment on dev.
5. Promote only exact green dev via protected CI; verify main and Pages byte smoke.

## Ownership and exclusions
Only own checkpoint writable; never read/edit another agent memory, create branches or force push.

## Evidence
Prior exact-head CI and Pages green; Render only initial deployment/events. New feature not yet CI certified.

## Cleanup
Under 4 KiB. Report hosted/device LAN limits truthfully.
