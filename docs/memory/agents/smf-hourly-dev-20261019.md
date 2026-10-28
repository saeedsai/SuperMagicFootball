# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-28 02:02 CET

## Mission
Continue one bounded feature each run on existing dev even with CI/Pages pending. Only dev/main; no bypass, force push or disabling hourly schedule. Preserve 223 teams/2676 players, six formations, four buttons, offline saves, Career/Cup ten slots and SD09.

## Current checkpoint
- Baseline dev/main `f99e9deef0db1f6b9ecc5379f1577cf3b590af71` (0.11.4.16). Prior Full #40606270252 and Modular #40606270217 green only for baseline.
- LAN-075 candidate 0.11.4.17: if host physics transitions to paused/finished within `game.update`, immediately clear guest held-button edges/gap state in finally, because next frozen step is skipped. Regression covers both phases, fresh Jump on resume and no repeat on subsequent held frame.
- About/package/README/SW/policy/shared/log aligned. Current exact dev head must be fetched; CI and protected promotion not yet certified. Physical two-device LAN/P2P and hosted Pages bytes remain unverified.

## Next smallest action
1. Inspect exact-head full 4 Node + 4 Chromium and Modular; fix red checks on dev.
2. Protected green exact-head dev-to-main promotion only.
3. Confirm main SHA, Pages deployment and hosted HTML/JS/CSS byte smoke.
4. Two-phone LAN/P2P discovery, host consent, reconnect, input and graphics QA.
5. Continue next small Studio, counterable Trick or directional-art increment on dev regardless of release queue.

## Safety
Only own checkpoint, no other agents' memory; no new branches or force pushes. Previous green runs do not certify new candidate.
