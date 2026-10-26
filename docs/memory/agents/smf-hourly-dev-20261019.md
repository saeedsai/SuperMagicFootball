# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26 15:09 CET

## Mission
Single existing dev branch development; main via protected exact-head CI promotion only. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, saves and offline.

## Current checkpoint
- Candidate 0.10.7.12 LAN-069: host clears held guest button-edge memory after RTC disconnect, enabling first press after reconnect. Focused V8 source execution passed; Node/Chromium/Modular CI not yet verified.
- 0.10.7.11 LAN-068: guest send returning false does not advance input frame cursor; regression verifies retry uses the same frame. Prior candidate 0.10.7.10 resets guest Super Shot trails on goals, halftime and teleports.
- At baseline dev was 22 commits ahead of main c463780b5f38205d868c64fd9ea16033d8bcfe7c. Exact-head full 4 Node + 4 Chromium, Modular QA, promotion/Pages byte smoke and physical two-device LAN remain to verify. Never claim certified on source-only testing.

## Next smallest action
1. Check exact dev head and CI shards and repair failures.
2. Promote only exact green head via protected main pipeline; Pages byte smoke.
3. Two-phone LAN discovery, consent, play and reconnect verification.
4. Continue Player Studio counterable Tricks.
5. Fix Crown Royals direction/view animation QA.

## Ownership and exclusions
Only own checkpoint writable; no new branches, force push, bypass, other agents' memory or unverified release claims.

## Evidence
- Modular QA #40328411505 source-and-data failed 1/841 Node tests: project_memory_contract requires exact checkpoint headings and backticked Agent ID. Documentation-only repair; no version bump.
- Baseline dev 14112245bd807035158ed7f271205d692d090985; main c463780b5f38205d868c64fd9ea16033d8bcfe7c.

## Cleanup
Keep under 4 KiB; preserve rosters, controls, saves and offline.
