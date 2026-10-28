# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-28 04:02 CET

## Mission
Continue bounded development directly on dev despite pending release. Only dev/main, no force push or CI bypass; hourly schedule stays enabled. Preserve 223 teams/2676 players, six formations, four buttons, offline/save compatibility, Career/Cup ten slots and SD09.

## Current checkpoint
- Baseline synchronized dev/main `2316666afe5afc8ef4f1cd2c77eef987ba8a9b81` (0.11.4.18). Previous Full #40619068873 Node 4/4 + Chromium 4/4 + preflight/preview and Modular #40619068792 passed for that baseline only.
- LAN-077 candidate 0.11.4.19: host snapshot delivery requires explicit `snapshotSent===true`. Null, missing or malformed receipts do not suppress frozen-phase retry. Focused LAN-077 test covers seven failure shapes and successful retry without physics.
- About, package, README dated candidate banner/heading, SW cache, version contract, policy, shared memory and central log updated. New exact dev head and CI/Pages/physical acceptance require fresh evidence.

## Next smallest action
1. Inspect/fix exact-head Modular and four Node/four Chromium CI.
2. Promote only exact fully green dev via protected PR; never bypass.
3. Confirm main SHA, Pages deployment and hosted HTML/JS/CSS byte smoke.
4. Validate two-phone LAN discovery, consent, P2P reconnect, gameplay and graphics.
5. Continue bounded Player Studio, counterable Trick or directional-art feature on dev regardless of release queue.

## Ownership and exclusions
Only own checkpoint; no other agents' memory, no extra branches, no force push or weakened CI.

## Evidence
- Source and tests committed using fresh GitHub blob SHAs; CI authoritative after final head. No real two-device or hosted-byte certification yet.

## Cleanup
- Keep dev/main only; continue hourly coding while release gates remain pending.
