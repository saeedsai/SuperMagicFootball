# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
Implement bounded changes on dev; promote only exact green head via protected pipeline. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline and saves. Only dev/main, no force-push or bypass.

## Current checkpoint
- Candidate 0.11.3.6: approved LAN/Online P2P guest times out after 25 seconds without host offer, releases seat and resumes discovery; host handles failed offer send. Three Node regressions.
- Baseline dev/main `c83b8fa57ebe36049fd8866ecb10a363d4f1fa2f` green: dev Modular #40424489450, dev Full 4+4 #40424490550, main Full hosted smoke #40424946688 and Pages #40424946166.
- Candidate requires new exact-head CI and Pages. Physical LAN/P2P and TURN-dependent cross-network play remain unverified.

## Next smallest action
1. Complete exact-head Modular and four Node/four Chromium shards; repair failures.
2. Promote only exact green dev head to main.
3. Verify Pages deployment and hosted HTML/JS/CSS bytes.
4. Validate real two-device LAN/P2P and Render broker scope, plus TURN limitations.
5. Continue Player Studio, counterable Magic Tricks and Crown Royals art QA.

## Ownership and exclusions
Sole authorized developer on dev; only dev/main. No other agents' memory; no bypass of CI, security or protections.

## Evidence
Baseline certified workflow links in central log. Red-before/green-after source-executed offer-timeout smoke; permanent Node cases pending exact-head CI.

## Cleanup
Own checkpoint under 4 KiB. No other agent memory or branch touched.
