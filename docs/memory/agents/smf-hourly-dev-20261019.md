# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-10-27

## Mission
Continue small tested increments directly on dev; protected exact-green promotion to main only. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, saves and offline play.

## Current checkpoint
- Base dev 331ba11d652e9d7f47f8d46cf2aec18c9ce2cd96; main b3c8100a88e924dd4209396898116877602d284d; PR #56 open. 0.11.4.8 candidate: approved internet relay retains a single early guest protocol hello until host channel opens, preventing loss before SDP answer acceptance; new P2P-RELAY-05 source regression. Pending new exact-head checks, Pages, Render and physical two-client acceptance.
- Existing 0.11.4.7 broker UTF-8 size check remains. Earlier source notes and prior CI are not evidence of this candidate.
- At inspection Full #40545674602 pending (0 jobs) and Modular #40545674623 queued on prior 331ba11d. GitHub Actions scheduler not yet running the complete suite; no bypass.

## Next smallest action
1. Inspect new exact-head 4 Node + 4 Chromium Full Census and Modular QA, repair any failures.
2. If exact head fully green, promote through existing protected PR #56, not a direct push.
3. Verify main Pages deployed byte smoke and hosted Render broker health.
4. Run real two-device Wi-Fi LAN and cross-network P2P Host/Approve/Play/Relay.
5. Continue Player Studio, counterable four-button Tricks, Crown Royals directional art QA.

## Ownership and exclusions
Only dev for code, main for protected release. Never create branches, force push, bypass checks, touch other agents' memory or claim device QA without devices.

## Evidence
Source regression committed as test but not locally executed in connector-only runtime; exact-head CI still pending. Old main remains certified only at its prior SHA.

## Cleanup
Keep this checkpoint below 4 KiB; maintain central dev log and truthful versioning.
