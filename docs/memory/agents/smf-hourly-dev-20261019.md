# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26

## Mission
Code directly on dev; promote exact green dev through protected main. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline saves.

## Current checkpoint
- 0.11.3.4 candidate: signaling error event now retires/retries broken socket even if no close event follows; manual lobby shutdown survives close exceptions. Two focused lifecycle regressions.
- Prior 0.11.3.3 exact SHA `3ee63dcb97cec64424b452bd1f0a38bda9fb120b`: dev Modular #40410020795, Full 4+4 #40410021242, main Full/hosted smoke #40411790991, Pages #40411791238 green. Not certification of newer candidate.
- Physical two-phone LAN and internet P2P remain uncertified; Render backend deployment and TURN-restricted networks require separate validation.

## Next smallest action
1. Inspect exact-head Modular and four Node + four Chromium jobs; repair failures.
2. Promote only green exact dev and verify main/Pages hosted bytes.
3. Validate hosted signaling broker, room scope and real two-phone play.
4. Implement bounded Player Studio/counterable Trick improvement.
5. Audit Crown Royals directional animation with regression.

## Ownership and exclusions
Only dev/main; no force push, security bypass, weakened CI or other agents' memory.

## Evidence
Prior workflow IDs above; new candidate CI and real-device acceptance remain independent gates.

## Cleanup
Keep dev/main only; checkpoint under 4 KiB; retain historical audit.
