# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-29 02:06 CET

## Mission
Keep bounded commits on existing dev; no new branches, force push, security bypass or paused hourly development.

## Current checkpoint
- 0.11.4.45 LAN-094: busy/version-mismatch `join-reject` omitted `roomId`; guest requires both IDs, so waited 25 seconds. Correlated broker reply and broker/two-mode guest regressions added; CI/deployment not yet certified.
- Baseline 0.11.4.44 dev/main synchronized at `9d7849faabf8a3889b8f3884748447d0a1105422` before this increment.
- Render last observed LIVE `2715ecc1` (0.11.4.43), API deployment; auto commit-trigger unreliable. Physical two-device acceptance open in issue #48.
- Preserve 223 teams/2676 players, six formations, four controls, saves/offline, Career/Cup ten slots and SD09.

## Next smallest action
1. Check focused LAN-094 tests and exact-head 4 Node + 4 Chromium plus Modular QA.
2. Repair genuine CI failures without weakening tests.
3. Promote only exact green dev head through protected PR; verify main/Pages bytes.
4. Verify Render broker and auto-deploy; obtain physical two-device acceptance where possible.
5. Once LAN/P2P certified, shift to Player Studio, counterable Tricks, eight-view graphics, gameplay and Career.

## Ownership and exclusions
Sole developer smf-hourly-dev-20261019; only own checkpoint edited.

## Evidence
- Baseline `9d7849fa`; Render prior LIVE `2715ecc1`. LAN-094 QA/hosted acceptance pending.

## Cleanup
Checkpoint under 4 KiB; Git history retains earlier work.
