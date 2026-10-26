# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26

## Mission
One bounded tested feature on existing dev per run, no extra branches, bypass or force push. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup save slots, SD09, offline/saves.

## Current checkpoint
- Baseline dev ed7babae0e63c03c20410d60229f72db92c62c11 (0.10.7.8), Modular #40327113745 green, Full #40327113649 running; main c463780b5f38205d868c64fd9ea16033d8bcfe7c (0.10.7.7).
- LAN-066 0.10.7.9 candidate: prevent false normal-ball velocity on score or halftime transition, even when relocation is under 160 px. Test verifies both transitions, position, resume pass. Host physics, saves, controls remain intact.
- Physical two-phone LAN acceptance outstanding. Candidate remains uncertified until exact-head CI and protected Pages release.

## Next smallest action
1. Verify exact-head Modular and full 4 Node + 4 Chromium CI, fix any failures.
2. Promote only exact green dev to main through protected pipeline; verify Pages bytes and main CI.
3. Test two phones: short restart ball, goals/halftime, supershots and dives.
4. Improve LAN guest animation and Crown Royals side sprites on dev.
5. Diagnose Render automatic room discovery and reconnect.

## Evidence
- LAN-066 source-executed regression: tests/lan_live_match.test.cjs. CI outcomes are release authority.

## Ownership and exclusions
Only this agent checkpoint writable; do not touch other agent memories.

## Cleanup
- Keep checkpoint below 4 KiB. Git history is audit; no extra branches or temporary files.
