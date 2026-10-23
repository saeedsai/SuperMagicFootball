# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · Updated 2026-10-24.

## Mission
Continue one bounded dev feature per iteration and safely repair CI. No new branches, force push or bypass.

## Current checkpoint
- LAN-007 handshake-gated peer receiver: a7467a22 adds immutable peer state and rejects input before complementary version/session hello, replay and renegotiation; 992615ba adds regressions. Non-player-facing foundation only; package/About remains 0.9.29.2. Earlier main/dev both bfad8158. CI and Pages still require exact-head verification.
- LAN-006 non-UI transport boundary: 16426d20 adds validated send/receive for an already-open WebRTC-compatible data channel, and 92683b97 adds tests for replay, malformed frames, channel readiness and four-button inputs. No signaling or live LAN game yet. Base main/dev was synchronized at 10a1e348 before development; exact-head CI and Pages/visual QA pending.
- LAN-005 guest sender: commit 1940052f adds sequenced guest input packet builder; b77edc65 adds Node regression for monotonic frames, action validation, atomic rejection and host queue interoperability. Transport independent, not playable LAN; package/About version unchanged. main/dev previously identical at 28de5112. Exact-head CI and Pages certification pending.
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

## Ownership and exclusions
Read only AGENTS.md, VERSIONING_POLICY, SHARED and this own checkpoint. Keep updating central dev log and own checkpoint. Never suspend authorized hourly development due to pending releases.

## Evidence
LAN-004 commits 164d23b8 and 14df7d2c are in dev. CI 40031378895 and 40031378823 failed on missing checkpoint identity; this change restores the exact test contract. Full latest-head CI must be rerun.

## Cleanup
Keep this checkpoint below 4 KiB and preserve the six required headings. No hosted/graphics certification without evidence.
