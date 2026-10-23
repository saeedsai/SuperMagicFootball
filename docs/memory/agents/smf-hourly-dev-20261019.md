# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** smf-hourly-dev-20261019 · **Updated:** 2026-10-23 23:59 Europe/Stockholm

## Mission
Only existing dev for coding, main for protected exact-green promotion. Never stop for pending CI or Pages. No branch creation, force push, safety bypass, or weakening checks. Keep 223 teams/2676 players, 6 formations, 4 action buttons, 10 Career/Cup slots, SD09, offline and saves.

## Current checkpoint
- Initial main a95f4675 and dev dfe05ec7 (ahead 4, behind 0). Last certified a95f4675: Modular QA 40024359317 and Full Census 40024359322 passed; hosted Pages smoke skipped.
- LAN-002 complementary peer handshake exists in src/modules/lan_protocol.js. LAN-003 new bounded host input queue (002e339a), regression tests (bd599451). Focused V8 runtime checks passed for queue, replay, consume and lead-window; full CI on new dev head not yet confirmed.
- LAN protocol not loaded by UI and no live two-browser networking. About-only version stays 0.9.29.2; no player-facing update.
- Central log records latest changes. Open issues include #38 keeper lane, #15 sprite orientation, #3 touch trick. Continue work while CI pending.

## Next smallest action
1. Inspect exact dev head CI, repair failures without bypass.
2. Continue LAN transport integration in bounded increments.
3. Run 4 Node + 4 Chromium + Modular QA on exact dev.
4. Promote only green exact dev to main and verify Pages bytes.
5. Progress counterable Tricks, Player Studio and quarter-angle graphics.

## Evidence and restrictions
Never claim hosted/graphics certification without evidence. Preserve source checkpoint and do not edit other agent memories. Keep this file below 4 KiB.
