# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26 07 CET

## Mission
One bounded tested dev increment hourly; only dev/main; no bypass, force push or extra branches.

## Current checkpoint
- Before edit dev `ca1be5150a08dfa7b4a870335913748dfce55018`, main `01dfa202e8ad76791717a1cb7935d1284bbc6a07`.
- Dev 0.10.6.3 Modular #40272473004 green; Full #40272472958 failed only hosted Render+Pages browser smoke: `#autoStatus` did not show Room registered within 25s. Four Node, three Chromium, preview passed. Requested rerun job 121408119298; investigate external readiness, not yet certified.
- New 0.10.6.4 candidate recovers approved guest offer/answer/ready/start failures: releases server seat via leave, resets pending state, refreshes room list and enables retry. Added focused Node regressions; exact-head CI pending.
- Render srv-dbf8m6gm7kps7385tjo0 autoDeploy=yes dev but only c871ee69 live; no later events. Physical two-phone LAN unverified.
- Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves.

## Next smallest action
1. Complete exact-head 4 Node+4 Chromium and Modular QA, repair red jobs.
2. Diagnose hosted Render room-registration timeout and missing auto-deploy integration.
3. Verify actual two-client host/guest, kickoff, controls, reconnect, graphics.
4. Continue Player Studio and counterable Tricks on dev.
5. Promote only exact green dev via protected CI; verify main/Pages byte smoke.

## Ownership and exclusions
Only own checkpoint writable; no other agent memory, branches or force pushes.

## Evidence
CI and deployment are not inferred from previous heads. New feature pending exact-head CI; hosted/device LAN unverified.

## Cleanup
Checkpoint <4 KiB; keep candidate separate from certified release.
