# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26

## Mission
Develop on dev only; promote exact green dev through protected main. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline saves.

## Current checkpoint
- 0.11.3.3 candidate: failed WebSocket sends and queue overflow now reconnect even if close throws; old socket events are ignored. Two focused Node regressions added.
- Prior 0.11.3.2 exact SHA `16e46a7816654682ff6b7e6c19cfa15a2a84c6e3` passed dev Modular #40401375792, dev Full 4+4 #40401375422, main Full/hosted smoke #40402612619 and Pages #40402613182. This does not certify 0.11.3.3.
- Two-phone LAN and cross-network P2P remain uncertified; Render broker rollout and TURN-required networks need independent checks.

## Next smallest action
1. Inspect new exact-head Modular QA and four Node + four Chromium shards; repair failures.
2. Promote only green exact dev head and verify main/Pages hosted bytes.
3. Check Render broker deployment and physical two-phone LAN/P2P discovery.
4. Implement one bounded Player Studio/Trick counterplay improvement with regression.
5. Audit Crown Royals side/quarter animation continuity and correct a reproducible defect.

## Ownership and exclusions
Only dev/main; no force push, safety bypass, weakened CI or other agents' memory.

## Evidence
Prior workflow IDs above; new candidate CI and physical device acceptance are separate gates.

## Cleanup
Keep only dev/main, own checkpoint under 4 KiB and historical audit.
