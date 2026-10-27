# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-10-27

## Mission
Continuous tested increments on existing dev; only protected exact-green promotion to main. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline/saves.

## Current checkpoint
- Baseline dev 0d394f77b383810d86b1a11c9c24b82f01eac766; main b3c8100a88e924dd4209396898116877602d284d; PR #56 open. 0.11.4.7 candidate fixes Unicode UTF-8 relay budget against 24,000-byte broker limit (outbound rejection/inbound discard) and adds a two-peer regression. Candidate only: exact-head CI, Pages, Render and physical two-client certification pending.
- Previous 0.11.4.6: broker flap backoff; workflow cancellation policy changed to preserve running full census. Earlier 0.11.4.3: approved WebRTC relay fallback.
- At inspection Full #40535793954 pending and Modular #40535793695 queued on prior head. Do not mistake older green jobs for this candidate.

## CI queue investigation — 2026-10-27 17:55 CET
- Dev 454114634383e689557734d67dfd087797c75c5e, main b3c8100a88e924dd4209396898116877602d284d. Full run #40537757831 remains pending since 16:07:14Z with zero jobs created; Modular #40537757576 queued. This is a workflow scheduling blocker, not evidence of a failing game test. No protected promotion or gameplay certification.

## Next five
1. Inspect exact-head Full 4 Node+4 Chromium and Modular QA; repair failures.
2. Promote only unchanged fully green dev head via protected PR #56.
3. Verify main GitHub Pages byte hashes and Render broker compatibility.
4. Run real two-phone Wi-Fi LAN and cross-network P2P Host/Approve/Play, including relay.
5. Continue Player Studio, counterable four-button Tricks and Crown Royals directional art.

## Cleanup
Keep checkpoint <4 KiB, do not touch other agents' memory, never create branches or force-push.
