# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26 10:15 CET

## Mission
One bounded tested increment per run on dev. Only dev/main, no bypass or force push.

## Current checkpoint
- Baseline dev/main `165a1ebc0a20e01ad704c63448622b1b5fef3deb` (0.10.7.1) green: dev Modular #40289887078, dev Full 4+4 #40289887080, main Full #40291272628, Pages #40291272622.
- LAN-059 0.10.7.2 candidate: guest formerly overwrote jump/special action with run/idle and lacked transformed Super Shot. Optional bounded host poses and ball effects added with legacy compatibility. Focused source checks and regression fixtures added; new CI and physical two-phone QA pending.
- Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline and saves. Render auto-deploy remains a separate risk.

## Next smallest action
1. Check new exact-head Modular and 4 Node+4 Chromium; repair failures.
2. Promote only green dev through protected workflow; verify main/Pages bytes.
3. Test two-phone host/guest jumping and Super Shots.
4. Synchronize missing guest Magic hazards and particles.
5. Diagnose Render broker auto-deploy and LAN discovery/reconnect.

## Ownership and exclusions
Only this checkpoint writable. Candidate is not certified release.

## Evidence
Baseline green; LAN-059 focused source checks and CI pending. No physical-device certification.

## Cleanup
Checkpoint under 4 KiB; Git history is durable audit.
