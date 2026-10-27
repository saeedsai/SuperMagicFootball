# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27 12:00 CET

## Mission
Continue bounded tested features directly on dev, even with pending release; only exact-head green protected promotion. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- Baseline dev/main 4655feb30a1d2a05ce1da01bc0fde313c8cbc368, merged 0.11.4.1 PR #54. Exact-head dev Modular #40485167540 and Full 4 Node + 4 Chromium #40485167337 passed; real devices and Render broker version not yet certified.
- 0.11.4.2 dev candidate LAN-ROOM-STALE-01: join(id) revalidates current room existence/build/schema, rejecting detached stale room buttons after removal or incompatible directory refresh. Regression covers LAN and internet P2P. No gameplay/roster/save/graphic changes. Exact-head CI and deployment pending.

## Next smallest action
1. Inspect focused Node regression, full 4+4 and Modular QA for exact dev head; repair failures.
2. Promote only unchanged green dev via protected PR/workflow; verify main/Pages hosted bytes.
3. Verify hosted Render signaling broker forwards guest names and is on current code.
4. Add secure TURN relay support and test actual two-phone/cross-network Host/Join/Play.
5. Continue Player Studio, counterable four-button Tricks and Crown Royals art.

## Ownership and exclusions
Only dev/main; own checkpoint only. No force-push or security/CI bypass.

## Evidence
`src/modules/lan-auto-lobby.js`, `tests/lan_auto_lobby_flow.test.cjs`, `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md`. Physical LAN/P2P and visual art not certified.

## Cleanup
Under 4 KiB; preserve historical source and save data.
