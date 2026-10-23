# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · **Updated:** 2026-10-23 Europe/Stockholm

## Mission
Continue bounded tested features on existing dev even while CI/promotion pending. Never create branches, force-push or bypass security.

## Current checkpoint
- Candidate 0.9.25.1 is green and promoted at a274be9506062809799ed1860d68e2831ad51f79; exact main hosted smoke and Pages deployment passed.
- New internal LAN host-to-guest snapshot channel sends validated bounded snapshots and filters foreign/stale/replayed messages; no gameplay replication or signaling yet.
- Preserve 223 canonical teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09 and offline saves.

## Next smallest action
1. Inspect exact-head 4 Node+4 Chromium and Modular QA; repair failures.
2. Wire snapshot host sender to actual match tick and guest renderer (without altering host physics).
3. Add two-browser independent RTCDataChannel convergence and reconnect tests.
4. Improve Crown Royals independent quarter-view/action artwork.
5. Continue Player Studio icons and counterable Tricks; promote only exact green dev head.

## Ownership and exclusions
Sole developer; no additional branches or edits to other agents' memory. Internal transport is not playable LAN certification.

## Evidence
Prior dev Full Regression Census 39975900788 and Modular QA 39975900771 PASS; main hosted smoke 39977469567 and Pages 39977470615 PASS. New isolated focused tests 4/4 PASS; new integrated CI pending. Local GitHub DNS unavailable.

## Cleanup
Checkpoint <4 KiB.
