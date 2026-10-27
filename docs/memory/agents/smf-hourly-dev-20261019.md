# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Bounded tested increments directly on dev despite release waits. Only green protected promotion, no extra branches or force-push. Preserve rosters, six formations, four controls, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- 0.11.3.12 candidate: ignore duplicate host LAN/P2P SDP answers during processing or transport readiness; cannot restart 25-second watchdog. Two Node regressions.
- Baseline dev/main bc264bfd0b37bf8b5c23b8fb803959f9052c7d6d: dev Modular #40458844304 and Full 4+4 #40458844302, main Full hosted smoke #40459608996 and Pages #40459608191 green. New candidate exact-head QA pending.
- Issue #48; real two-phone LAN and cross-network P2P/TURN not certified. Only dev/main; no open PR.

## Next smallest action
1. Inspect exact-head Modular and 4 Node + 4 Chromium; repair failures.
2. Promote only completely green unchanged dev through protected workflow.
3. Verify main Pages hosted HTML/JS/CSS bytes.
4. Validate physical LAN and internet P2P/TURN.
5. Continue Player Studio, counterable Tricks and Crown Royals graphics.

## Ownership and exclusions
Only dev/main; never read/edit other agents' memory.

## Evidence
`src/modules/lan-auto-lobby.js`, `tests/lan_auto_lobby_flow.test.cjs`; baseline runs above. New candidate CI pending.

## Cleanup
Checkpoint under 4 KiB; no roster, control, offline or save changes.
