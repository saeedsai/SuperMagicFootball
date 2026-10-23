# SuperMagicFootball — sole hourly developer checkpoint
Agent: smf-hourly-dev-20261019. Updated 2026-10-24.

## Current checkpoint
## 2026-10-24 — LAN-004: missing-frame neutral host input
- On dev, LAN-004 commits 164d23b8 (resolveGuestLanFrame) and 14df7d2c (focused regression): host produces immutable neutral four-button input when guest frame absent, and consumes real queued guest input without altering future frames. Transport independent, not user-facing; About bundle stays 0.9.29.2. Exact-head CI not yet certified.
- Prior exact main remains a95f4675; no independent hosted Pages or graphics visual certification. Do not merge dev until fresh 4 Node + 4 Chromium + Modular QA passes.

Preserve 223 teams/2676 players, six formations, exactly four action buttons, 10 Career/Cup slots, SD09, offline/save compatibility. No extra branch, force-push or bypass. LAN-001/002/003 remain foundation only, not live multiplayer.

## Next smallest action
1. Inspect exact dev CI for latest LAN-004 and fix failures.
2. Finish two-peer live transport and frame synchronization in bounded dev commits.
3. Require 4 Node + 4 Chromium + Modular QA exact-head green.
4. Permit protected main promotion only from fully certified dev; verify Pages SHA/bytes.
5. Continue counterable Tricks and Crown Royals independent directional graphics QA.

## Ownership
Read only AGENTS.md, VERSIONING_POLICY, SHARED and this own checkpoint. Keep updating central dev log and own checkpoint. Never suspend authorized hourly development due to pending releases.
