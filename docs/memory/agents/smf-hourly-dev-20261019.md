# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Continue bounded tested increments directly on dev despite release waits; only green exact-head protected promotion. Never create extra branches or force-push. Preserve 223 teams/2676 players, six formations, four buttons, Career/Cup ten slots, SD09, offline and saves.

## Current checkpoint
- 0.11.3.11 candidate: host LAN/P2P SDP answer processing now has a 25-second deadline after receipt. Stalled peers are released; old SDP failures cannot kill replacement sessions. Two focused Node regressions.
- Baseline dev/main `912123b354c7f9d665b831539b073442765e4898` identical; dev Modular #40452788651 and 4+4 #40452788588, main Full hosted smoke #40453518886 and Pages #40453518764 successful. This candidate requires its own exact-head checks.
- Open issue #48; physical two-phone LAN and cross-network P2P/TURN remain uncertified. Only dev/main and no open PR.

## Next smallest action
1. Inspect exact-head Modular and four Node/four Chromium jobs; repair failures.
2. Promote only completely green unchanged dev via protected workflow.
3. Verify main GitHub Pages and hosted HTML/JS/CSS bytes.
4. Test genuine two-device LAN and internet P2P/TURN.
5. Continue Player Studio, counterable four-button Tricks and Crown Royals directional art.

## Ownership and exclusions
Only dev/main; no other agents' memory read or edited.

## Evidence
`src/modules/lan-auto-lobby.js`, `tests/lan_auto_lobby_flow.test.cjs`; previous CI run IDs above. New candidate CI pending.

## Cleanup
Checkpoint under 4 KiB; no unrelated roster/save/control changes.
