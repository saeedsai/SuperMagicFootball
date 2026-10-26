# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26 14:00 CET

## Mission
One bounded tested increment each hourly run on existing dev. Only dev/main. No bypass or force push. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline/saves.

## Current checkpoint
- Baseline dev/main c463780b5f38205d868c64fd9ea16033d8bcfe7c (0.10.7.7), dev Modular #40323731508 and Full #40323731431 passed, Pages #40325446755 passed; main Full #40325446590 in progress at inspection.
- LAN-065 0.10.7.8 candidate: suppress guest ordinary-pass velocity when host ball displacement is larger than 160 pixels per authoritative snapshot (goal/kickoff teleport), while keeping authoritative position and normal-pass velocities. Regression test added; package/About/README/SW and policy aligned.
- Physical two-phone verification outstanding. Never call candidate certified before exact-head CI + Pages.

## Next smallest action
1. Check exact dev head Modular and Full 4 Node/4 Chromium CI; fix red jobs.
2. Promote only exact green head via protected pipeline and validate main/Pages bytes.
3. Test LAN ball restarts on two phones with real RTT; tune threshold as evidence requires.
4. Continue LAN reliability and Crown Royals directional sprite QA directly on dev.
5. Diagnose Render signaling broker discovery, reconnect and deployment.

## Evidence
- LAN-065: source-based Node regression in tests/lan_live_match.test.cjs. Full CI is release gate; no physical certification claimed.

## Ownership and exclusions
Only this agent checkpoint writable; no additional branches or permission bypass.

## Cleanup
- Keep checkpoint under 4 KiB; Git history is audit, no stale temporary files or extra branches.
