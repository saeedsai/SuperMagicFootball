# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26

## Mission
Develop on dev only; promote only an exact fully green SHA through protected main. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- Candidate 0.11.3.2: LAN/Online P2P discovery rejects inbound multibyte Unicode frames exceeding 210000 UTF-8 bytes; previously only UTF-16 length was checked. Focused regression added. No protocol/roster/save changes.
- Prior 0.11.3.1 baseline dev/main `1bfb5c163cefeb1e6b47e502c905137e1d88dbf0`: dev Modular #40393240315 and Full 4+4 #40393240205 green; main Full #40396672086 and Pages #40396670991 green. Those do not certify the new candidate.
- Physical two-phone LAN and cross-network P2P not certified. Render broker version/rollout still needs independent verification.

## Next smallest action
1. Check exact-head 4 Node + 4 Chromium and Modular QA for 0.11.3.2; fix failures.
2. Promote exact green dev head via protected workflow; verify main/Pages hosted bytes.
3. Verify Render signaling scopes and deployment; test two real phones.
4. Implement safe optional TURN configuration only when relay credentials exist.
5. Continue counterable Tricks, Player Studio and Crown Royals graphics QA.

## Ownership and exclusions
Only dev/main; no force push, security bypass or weakening tests. Edit only this developer checkpoint.

## Evidence
- Source-executed V8 focused Unicode ingress acceptance/rejection test; CI is authoritative for full Node/browser QA.

## Cleanup
Keep only dev/main and this developer checkpoint; preserve historical audit, IDs and save compatibility.
