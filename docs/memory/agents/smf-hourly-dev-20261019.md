# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Bounded tested increments directly on dev. Protected exact-green promotion only; no extra branches, force-push or bypass. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- 0.11.3.9 candidate: host LAN/P2P 25-second guest-answer deadline disposes stalled peer without closing host room; late answer success/rejection cannot affect replacement. Two focused regressions.
- Baseline dev/main `29ebbb29f32421d87f2668645bb3117ecafbe670` identical. Baseline dev Modular #40442165809, Full 4+4 #40442165792, main Full hosted smoke #40442543715 and Pages #40442543765 green.
- New candidate exact-head CI, protected promotion, hosted bytes and physical LAN/P2P/TURN acceptance pending.

## Next smallest action
1. Check exact-head Modular + four Node/four Chromium and repair failures.
2. Promote only fully green unchanged dev through protected pipeline.
3. Verify main Pages and hosted HTML/JS/CSS bytes.
4. Validate physical LAN and internet P2P/TURN.
5. Continue Player Studio, counterable Tricks and Crown Royals directional art.

## Ownership and exclusions
Only dev/main; no other agents' memory read or edited.

## Evidence
`src/modules/lan-auto-lobby.js`, `tests/lan_auto_lobby_flow.test.cjs`; prior green run IDs above.

## Cleanup
Checkpoint below 4 KiB; no new branches or unrelated changes.
