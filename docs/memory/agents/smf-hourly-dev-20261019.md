# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-27

## Mission
One bounded tested increment each run directly on dev even when release waits. Only dev/main and protected exact-green promotion. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- 0.11.4.6 dev candidate: short-lived LAN/Online P2P WebSocket opens no longer reset exponential retry backoff. A stable 30-second connection resets retries. Four focused source-executed Node regressions (LAN/P2P short-lived/stable) passed locally. Full exact-head CI pending.
- Previous 0.11.4.5: invalid explicit broker URL fails closed; 0.11.4.4: 60s hosted cold-start; 0.11.4.3: consent-scoped internet relay fallback.
- Baseline dev b56fe67be2cd0bcf2c46ad5339c63a555497e860; main b3c8100a88e924dd4209396898116877602d284d; PR #56 open. At inspection Full #40517980648 pending preflight, Modular #40517979707 queued; older Full #40508485325 cancelled. No new main/Pages/Render or real two-phone certification.

## Next five
1. Diagnose and repair exact-head queued/failing 4 Node+4 Chromium and Modular QA.
2. Promote only unchanged fully green dev head through protected PR #56.
3. Verify Pages hosted bytes and compatible Render broker.
4. Verify physical Wi-Fi LAN and cross-network P2P Host/Approve/Play, including relay.
5. Continue Player Studio, counterable four-button Tricks and Crown Royals directional art.

## Ownership
Sole developer only; no new branches, force pushes, security bypass or fabricated QA. Keep own checkpoint under 4 KiB.
