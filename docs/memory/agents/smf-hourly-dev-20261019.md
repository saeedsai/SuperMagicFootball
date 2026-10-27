# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Bounded increments on dev; protected exact-green promotion only. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves. Only dev/main; no force-push or bypass.

## Current checkpoint
- Candidate 0.11.3.7: guest SDP answer processing has a 25-second deadline after host offer. Stalls release seat and resume discovery; late answers ignored and success cancels deadline. Two Node regressions.
- Baseline dev/main `5158446d58a74b6d5a91cea07c5153b974067891` green: dev Modular #40430557655, Full 4+4 #40430557553, main Full hosted smoke #40431545841 and Pages #40431545633.
- New exact-head QA, protected promotion and hosted bytes pending. Physical two-device LAN/P2P and TURN-dependent internet play uncertified.

## Next smallest action
1. Inspect exact-head Modular QA and four Node/four Chromium shards; repair failures.
2. Promote only exact green dev head through protected pipeline.
3. Verify Pages and hosted HTML/JS/CSS bytes for main SHA.
4. Validate real two-device LAN/P2P and TURN requirements.
5. Continue Player Studio, counterable Tricks and Crown Royals directional art.

## Ownership and exclusions
Sole developer on dev; only dev/main. No other agent memory; no bypass of CI or security.

## Evidence
Prior certified workflow IDs in central log. New regression cases in tests/lan_auto_lobby_flow.test.cjs; exact-head QA pending.

## Cleanup
Own checkpoint under 4 KiB. No unrelated branches or memory changed.
